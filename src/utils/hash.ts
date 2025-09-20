import { compare, genSalt, hash } from 'bcrypt';

export async function hashPassword(input: string) {
  const salt = await genSalt(10);
  return await hash(input, salt);
}

export async function comparePassword(input: string, hash: string) {
  return await compare(input, hash);
}
