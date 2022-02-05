import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { expect, jest } from '@jest/globals';
import { doesNotMatch } from 'assert';
import { PrismaService } from '../src/prisma.services';
import { hashPasswordSync } from '../src/common/utils/password';

jest.useFakeTimers('legacy');
jest.setTimeout(10000);
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let prismaService: PrismaService;
  let testUserToCreate = {};
  let userDto = {
    id: 8,
    name: 'New Name',
  };
  let userToDelete: any = {};
  let authenticateUserDto: any = {
    email: 'newjamesake-mail.coma',
    password: 'password',
  };
  let adminToken: string = '';
  let userToken: string = '';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    userService = app.get<UserService>(UserService);
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();

    testUserToCreate = {
      email: 'test@gmail.com',
      password: 'Test@123456',
      name: 'TestUser',
    };

    userToDelete = await prismaService.user.create({
      data: {
        name: 'James',
        email: 'james@yahoo.com',
        is_admin: false,
        credentials: {
          create: {
            hash: hashPasswordSync('password'),
          },
        },
      },
    });

    const adminTokenResponse = await userService.authenticateAndGetJwtToken({
      email: 'admin@gmail.com',
      password: 'Password@123456',
    });
    const userTokenResponse = await userService.authenticateAndGetJwtToken({
      email: 'newjamesake-mail.coma',
      password: 'password',
    });
    adminToken = adminTokenResponse.token;
    userToken = userTokenResponse.token;
  });

  describe('/user (POST)', function () {
    it('should return 401 since we do not send authorization', (done) => {
      request(app.getHttpServer())
        .get('/user')
        .send(testUserToCreate)
        .set('Accept', 'application/json')
        .expect(401)
        .end(done);
    });
  });

  describe('/user (POST)', function () {
    it('should create the user with admin user', function () {
      return request(app.getHttpServer())
        .post('/user')
        .send(testUserToCreate)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.email).toEqual('test@gmail.com');
        });
    });
  });

  describe('/user (POST)', function () {
    it('should not create the user because password is week', function () {
      return request(app.getHttpServer())
        .post('/user')
        .send({ ...testUserToCreate, password: '123456' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.message[0]).toEqual(
            // eslint-disable-next-line max-len
            'Password must have at least one uppercase, one lowercase, one digit, and one special character and at least 8 characters',
          );
        });
    });
  });

  describe('/user (POST)', function () {
    it('should have status of 401 since user is not admin', function (done) {
      request(app.getHttpServer())
        .post('/user')
        .send(testUserToCreate)
        .set('Authorization', `Bearer ${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });
  });

  describe('/user (GET)', function () {
    it('should get all users for admin', function (done) {
      request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(1);
          done();
        });
    });
  });

  describe('/user/:id (GET)', function () {
    it('should get a single user for admin', function (done) {
      request(app.getHttpServer())
        .get('/user/13/')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).toHaveProperty('name');
          expect(res.body.id).toEqual(13);
          done();
        });
    });
  });

  describe('/user (PATCH)', function () {
    it('should update the user', function (done) {
      request(app.getHttpServer())
        .patch('/user')
        .send(userDto)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.name).toEqual(userDto.name);
          done();
        });
    });
  });

  describe('/user (POST)', function () {
    it('should delete the user', function (done) {
      request(app.getHttpServer())
        .delete('/user')
        .send({ id: userToDelete.id })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.name).toEqual('(deleted)');
          expect(res.body.email).toEqual(null);
          done();
        });
    });
  });

  describe('/user/validate (POST)', function () {
    it('should validate the token', function (done) {
      request(app.getHttpServer())
        .post('/user/validate')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).toHaveProperty('exp');
          done();
        });
    });
  });

  describe('/user/authenticate (POST)', function () {
    it('should authenticate the user', function (done) {
      request(app.getHttpServer())
        .post('/user/authenticate')
        .send(authenticateUserDto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).toHaveProperty('credentials');
          done();
        });
    });
  });

  describe('/user/token (POST)', function () {
    it('should get token', function (done) {
      request(app.getHttpServer())
        .post('/user/token')
        .send(authenticateUserDto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.token).toMatch(new RegExp(`^eyJ?`));
          done();
        });
    });
  });
});
