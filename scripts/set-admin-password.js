import bcrypt from 'bcryptjs'

const password = 'asdasx555'
const hash = await bcrypt.hash(password, 10)

console.log('Password hash for asdasx555:')
console.log(hash)
