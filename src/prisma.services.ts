import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private DELETED_USER_NAME = '(deleted)';
  async onModuleInit() {
    await this.$connect();
    await this.$use(async (params, next) => {
      // Check incoming query type
      if (params.action == 'update') {
        params.args['data']['updated_at'] = new Date();
      }
      if (params.model == 'User' && params.action == 'delete') {
        // Change action to an update
        params.action = 'update';
        // Set field value
        params.args['data'] = {
          deleted: true,
          name: this.DELETED_USER_NAME,
          email: null,
          updated_at: new Date(),
          credentials: { delete: true },
        };
      }
      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
