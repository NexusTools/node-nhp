@noautocompile

interface Resolver {
	resolve(callback:Function => (err, value:any));
}