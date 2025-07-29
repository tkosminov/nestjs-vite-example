import { MixedList } from 'typeorm';

import { User1753788539757 } from './migrations/1753788539757-user';

const migrations: MixedList<string | Function> = [User1753788539757];

export { migrations };
