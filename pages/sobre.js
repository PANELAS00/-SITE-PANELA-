import Head from 'next/head';
import Layout from '../components/Layout';

export default function Sobre() {
  return (
    <Layout>
      <Head>
        <title>Sobre Nós - WS Fábrica de Panelas</title>
        <meta name="description" content="Conheça a WS Fábrica de Panelas: tradição em pedra sabão e cobre de Ouro Preto para sua cozinha. Qualidade artesanal e durabilidade." />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Sobre Nós</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Nossa Missão</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Trazer a tradição da culinária mineira para lares modernos através de utensílios artesanais em pedra sabão e cobre. 
            Nossa missão é preservar a cultura de Ouro Preto, oferecendo produtos que combinam saúde, sabor e durabilidade inigualável.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tradição de Ouro Preto</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Localizados no coração de Minas Gerais, a WS Fábrica de Panelas nasceu da paixão pelo artesanato mineiro. 
            Cada peça é produzida manualmente, respeitando as técnicas ancestrais que tornaram a pedra sabão famosa no mundo todo.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Endereço</h3>
            <p className="text-gray-600">
              Rua Rio de Janeiro 105<br />
              Vila Alegre (Cachoeira do Campo)<br />
              Ouro Preto, MG - CEP: 35410-060
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Contato</h3>
            <p className="text-gray-600">
              Email: contato@wspanelas.com<br />
              WhatsApp: +57 311 865 6289
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
