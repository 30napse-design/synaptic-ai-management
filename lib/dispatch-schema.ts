import {db} from './staff-server';
export async function dispatchSchemaReady(){return !!await db().prepare("SELECT name FROM pragma_table_info('ops_items') WHERE name='routing'").first()}
