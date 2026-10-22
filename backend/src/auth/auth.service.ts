import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UsersService } from '../users/users.service.js';
import { MailService } from '../common/services/mail.service.js';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    const payload: JwtPayload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        user.googleId
          ? 'This account was created using Google. Please log in using "Continue with Google".'
          : 'Invalid email or password',
      );
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }

  async googleLogin(dto: GoogleLoginDto) {
    if (!dto.idToken || !dto.idToken.trim()) {
      throw new BadRequestException('Google ID token is required');
    }

    try {
      // Verify Google ID token using Google's official tokeninfo endpoint
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(dto.idToken.trim())}`,
      );

      if (!response.ok) {
        throw new UnauthorizedException('Invalid or expired Google authentication token.');
      }

      const googleData = (await response.json()) as {
        sub: string;
        email: string;
        email_verified?: string | boolean;
        name?: string;
        picture?: string;
        aud?: string;
      };

      if (!googleData || !googleData.sub || !googleData.email) {
        throw new UnauthorizedException('Incomplete profile data received from Google.');
      }

      if (googleData.email_verified === 'false' || googleData.email_verified === false) {
        throw new UnauthorizedException('Google email address has not been verified.');
      }

      // Verify audience if configured in environment
      const configuredClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (configuredClientId && googleData.aud && googleData.aud !== configuredClientId) {
        throw new UnauthorizedException('Google token audience does not match configured client ID.');
      }

      // Find existing user by googleId/email or auto-create account
      const user = await this.usersService.findOrCreateGoogleUser({
        googleId: googleData.sub,
        email: googleData.email,
        name: googleData.name || googleData.email.split('@')[0],
        avatarUrl: googleData.picture,
        role: dto.role,
      });

      const payload: JwtPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);

      return {
        access_token: token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new UnauthorizedException(`Google authentication failed: ${err.message}`);
    }
  }

  async getMe(userId: string) {
    const user = await this.usersService.findByIdSafe(userId);
    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Verify account exists before generating or sending password reset link
    if (!user) {
      throw new NotFoundException(
        'No account found with this email address. Please check your spelling or register a new account.',
      );
    }

    // Generate 32-byte secure random hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await this.usersService.setResetPasswordToken(user.email, hashedToken, expires);

    // Send email via Resend (or log to terminal in simulation mode)
    const result = await this.mailService.sendPasswordResetEmail(user.email, rawToken, user.name);

    return {
      success: true,
      message: `A password reset link has been dispatched to ${user.email}.`,
      simulated: result.simulated,
      previewUrl: result.simulated ? result.resetUrl : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');
    const user = await this.usersService.findByResetToken(hashedToken);

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset link. Please request a new one.');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.usersService.updatePassword(user._id.toString(), newHash);

    return {
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new password.',
    };
  }
}
