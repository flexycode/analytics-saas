import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
    @ApiProperty({ description: 'JWT access token' })
    accessToken: string;

    @ApiProperty({ description: 'JWT refresh token' })
    refreshToken: string;

    @ApiProperty({ example: '15m', description: 'Access token expiration time' })
    expiresIn: string;
}
