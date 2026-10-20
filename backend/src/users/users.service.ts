import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserRole } from '../common/interfaces/user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<UserDocument, 'passwordHash'>> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase().trim(),
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel({
      name: createUserDto.name.trim(),
      email: createUserDto.email.toLowerCase().trim(),
      address: createUserDto.address.trim(),
      passwordHash,
      role: createUserDto.role || UserRole.USER,
    });

    const saved = await createdUser.save();
    const userObj = saved.toObject();
    delete (userObj as any).passwordHash;
    return userObj;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdSafe(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as any;
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }
}
