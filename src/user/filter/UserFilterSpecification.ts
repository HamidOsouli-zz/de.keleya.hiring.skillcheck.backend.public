import { Prisma } from '@prisma/client';
import { FindUserDto } from '../dto/find-user.dto';

const createUserFilterSpecification = (findUserDto: FindUserDto) => {
  const whereCondition: Prisma.UserWhereInput = {};
  if (findUserDto.email) {
    whereCondition.email = {
      contains: findUserDto.email,
    };
  }
  if (findUserDto.id) {
    whereCondition.id = {
      equals: findUserDto.id,
    };
  }
  if (findUserDto.name) {
    whereCondition.name = {
      contains: findUserDto.name,
    };
  }
  if (findUserDto.updatedSince) {
    whereCondition.updated_at = {
      gte: new Date(Number(findUserDto.updatedSince)),
    };
  }
  return whereCondition;
};

export default createUserFilterSpecification;
