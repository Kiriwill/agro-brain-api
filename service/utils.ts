
export default async function formatCpfCnpj(field:string){
	return Promise.resolve(field.replace('/[^\d]/g',''));
}
