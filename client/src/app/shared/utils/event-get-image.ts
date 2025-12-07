export function eventGetImage(target: EventTarget | null): File {
	if(target == null || !(target instanceof HTMLInputElement)) throw new Error("target has to be input");

	const file = target.files?.item(0);
	if(file == null) throw new Error("no file");

	return file;
}
