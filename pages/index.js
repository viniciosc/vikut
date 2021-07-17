import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons';
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSidebar(propriedades) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${propriedades.githubUser}.png`} style={{ borderRadius: '8px' }} />
      <hr />
      <p>
        <a className="boxLink" href={`http://github.com/${propriedades.githubUser}`}>
          @{propriedades.githubUser}
        </a>
      </p>
      <hr />
      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox(props) {
  return (

    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {props.title} ({props.items.length})
      </h2>
      <ul>
        {/* {comunidades.map((pessoa) => {
          return (
            <li key={pessoa.id}>
              <a href={`/users/${pessoa.title}`}>
                <img src={pessoa.image} />
                <span>{pessoa.title}</span>
              </a>
            </li>
          )
        })} */}
      </ul>
    </ProfileRelationsBoxWrapper>

  )
}

export default function Home(props) {
  const githubUser = props.githubUser;
  const [comunidades, setComunidades] = React.useState([]);
  // const comunidades = comunidades[0];
  // const alteradoDeComunidades/setComunidades = comunidades[1];

  const pessoasFavoritas = [
    'danzin3',
    'juunegreiros',
    'omariosouto',
    'peas',
    'felipefialho'
  ]
  // 0 - Pegar o array de dados do gitHub
  const [seguidores, setSeguidores] = React.useState([])
  React.useEffect(() => {
    fetch(`https:/api.github.com/users/${githubUser}/followers`)
      .then((resp) => {
        return resp.json();
      })
      .then((resp) => {
        setSeguidores(resp);
      })

    //API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': '5596e6efb7caec6f63ca66d5840e1d',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        "query": `query { 
        allCommunities {
          title
          id
          imageUrl
          creatorSlug
        } 
      }`})
    }).then((response) => response.json())
      .then((res) => {
        const comunidadesVindaDoDato = res.data.allCommunities
        setComunidades(comunidadesVindaDoDato)
        console.log(res)
      })
  }, [])

  //1 - Criar um box que vai ter um map, baseado nos items do array que pegamos do GitHub

  return (
    <>
      <AlurakutMenu githubUser={githubUser} />
      <MainGrid>

        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar githubUser={githubUser} />
        </div>

        <div style={{ gridArea: 'welcomeArea' }}>
          <Box className="title">
            Bem vindo(a)

            <OrkutNostalgicIconSet />
          </Box>

          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target);

              const comunidade = {
                title: dadosDoForm.get('title'),
                imageUrl: dadosDoForm.get('image'),
                creatorSlug: githubUser
              }

              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade)
              })
                .then(async (response) => {
                  const dados = await response.json();
                  const comunidade = dados.registroCriado;
                  const comunidadesAtualizadas = [...comunidades, comunidade];
                  setComunidades(comunidadesAtualizadas);
                })

            }}>

              <div>
                <input
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type="text"
                />
              </div>

              <div>
                <input
                  placeholder="Coloque uma URL para usarmos de capa?"
                  name="image"
                  aria-label="Coloque uma URL para usarmos de capa?"
                />
              </div>

              <button>
                Criar comunidade
              </button>
            </form>
          </Box>

        </div>

        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>

          <ProfileRelationsBox title="Seguidores" items={seguidores} />

          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidade ({comunidades.length})
            </h2>
            <ul>
              {comunidades.map((pessoa) => {
                return (
                  <li key={pessoa.id}>
                    <a href={`/communities/${pessoa.id}`}>
                      <img src={pessoa.imageUrl} />
                      <span>{pessoa.title}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>

          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Pessoas da comunidade ({pessoasFavoritas.length})
            </h2>
            <ul>
              {pessoasFavoritas.map((pessoa) => {
                return (
                  <li key={pessoa}>
                    <a href={`/users/${pessoa}`} >
                      <img src={`https://github.com/${pessoa}.png`} />
                      <span>{pessoa}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>

      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  const token = cookies.USER_TOKEN;

  const {isAuthenticated} = await fetch('https://alurakut.vercel.app/api/auth', {
    headers:{
      Authorization: token
    }
  })
  .then((resposta)=> resposta.json())

  
  if(!isAuthenticated){
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }
  
  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    }
  }
}