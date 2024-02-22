import { registerAs } from "@nestjs/config"

export  default registerAs('redis', () => {
    const ttl = process.env.REDIS_TTL || 86400000
    const host = process.env.REDIS_HOST || 'localhost'
    const port = process.env.REDIS_PORT || 6379

    return {
        ttl,
        host,
        port
    }
})