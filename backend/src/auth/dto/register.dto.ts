import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'john@example.com', description: 'User email address' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'SecureP@ss123', description: 'Password (min 8 chars)' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @MaxLength(128, { message: 'Password must not exceed 128 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
    )
    password: string;

    @ApiProperty({ example: 'John', description: 'User first name' })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'User last name' })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    lastName: string;
}
