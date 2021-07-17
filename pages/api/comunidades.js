import { SiteClient } from 'datocms-client';

export default async function recebedorDeRequest(request, response) {

    if (request.method === 'POST') {
        const TOKEN = 'a45c3527a14c60f9248b6992864649';
        const client = new SiteClient(TOKEN);

        //Validar os dados, antes de sair cadastrando
        const registroCriado = await client.items.create({
            itemType: "967572",
            ...request.body
            // title: "Comunidade de Teste",
            // imageUrl: "https://www.minimundi.com.br/cdn/imagens/produtos/original/miniatura-carro-dodge-charger-r-t-1969-1-25-maisto-design-32537_a.jpg",
            // creatorSlug: "Carlos Santos",
        })

        response.json({
            registroCriado
        })
        return;
    }

    response.status(404).json({
        message:'Ainda não temos nada no GET, mas no POST tem!'
    })



}