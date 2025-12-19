import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(email: string, password: string, role: 'user' | 'admin' = 'user') {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, password: hashed, role });
    return this.userRepo.save(user);
  }

  async updateRole(id: number, role: 'user' | 'admin') {
    const user = await this.findById(id);
    user.role = role;
    return this.userRepo.save(user);
  }

  async delete(id: number) {
    const user = await this.findById(id);
    return this.userRepo.remove(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

  async updateProfile(
    id: number,
    data: { firstName?: string; lastName?: string; phone?: string }
  ): Promise<User> {
    const user = await this.findById(id);

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;

    return this.userRepo.save(user);
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<User> {
    const user = await this.findById(id);
    user.avatar = avatarUrl;
    return this.userRepo.save(user);
  }

  async updateUser(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<User> {
    const user = await this.findById(id);

    // Check if email is being changed and if it's already in use
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.status !== undefined) user.status = data.status as any;

    return this.userRepo.save(user);
  }

  async updateUserRoles(id: number, roleIds: number[]): Promise<User> {
    const user = await this.findById(id);

    if (!roleIds || roleIds.length === 0) {
      user.roles = [];
      return this.userRepo.save(user);
    }

    const roles = await this.roleRepo.find({
      where: { id: In(roleIds) },
      relations: ['permissions'],
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    user.roles = roles;
    return this.userRepo.save(user);
  }
}
