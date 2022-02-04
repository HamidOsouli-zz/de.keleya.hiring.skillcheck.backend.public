export interface JwtTokenUser {
  username?: string | null;
  id: number | null;
}

export const isJwtTokenUser = (candidate: unknown): candidate is JwtTokenUser => {
  const user = candidate as JwtTokenUser;
  return user.username !== undefined && user.id !== undefined;
};

export interface JwtPayload {
  id: number;
  username: string;
}
