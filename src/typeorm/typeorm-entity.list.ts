import { EntitySchema, MixedList } from 'typeorm';

import { RecoveryKey } from '../models/recovery-key/recovery-key.entity';
import { RefreshToken } from '../models/refresh-token/refresh-token.entity';
import { User } from '../models/user/user.entity';

const entities: MixedList<string | Function | EntitySchema<any>> = [User, RefreshToken, RecoveryKey];

export { entities };
