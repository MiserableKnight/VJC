// app/lib/db.ts
// 此文件仅作为过渡，重新导出新的数据库模块，以保持向后兼容性

import db, * as database from '../database';

// 重新导出所有内容
export * from '../database';

// 导出默认对象
export default db; 