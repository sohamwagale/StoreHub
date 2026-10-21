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
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
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
