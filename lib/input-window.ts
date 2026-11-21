// Explicit Gregorian storage boundaries, with strict round-trip validation.
export function inputDay(value:unknown):value is string{
 if(typeof value!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function inputRange(start:unknown,end:unknown){return inputDay(start)&&(!end||inputDay(end)&&end>=start)}
export function inputTimestamp(value:unknown){
 if(typeof value!=='string')return '';
 if(/^20\d{2}-\d{2}-\d{2}$/.test(value))return inputDay(value)?value+'T00:00:00.000Z':'';
 if(!/^20\d{2}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!inputDay(value.slice(0,10)))return '';
 const date=new Date(value);return Number.isFinite(date.getTime())?date.toISOString():'';
}
