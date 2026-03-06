import React from 'react';
import {
  ChevronDown,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import Header from '../components/layout/Header';
import ProductGrid from '../components/produtos/ProductGrid';
import heroImg from '../assets/hero-section-image.png';

const Home = () => {
  console.log('Home component rendered');
  // static sample products mirroring screenshot layout
  const sampleProducts = [
    {
      id: 1,
      title: 'Calculo Volume 1',
      category: 'Material de Estudos',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Calculo+1',
      statusColor: 'bg-red-400',
    },
    {
      id: 2,
      title: 'Iphone 8',
      category: 'Tecnologia',
      price: '35.000',
      seller: 'Paulo Combo',
      img: 'https://via.placeholder.com/250x200?text=iPhone+8',
      statusColor: 'bg-green-400',
    },
    {
      id: 3,
      title: 'Calculo Volume 1',
      category: 'Livros',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Livro+1',
      statusColor: 'bg-red-400',
    },
    {
      id: 4,
      title: 'Calculo Volume 1',
      category: 'Livros',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Livro+2',
      statusColor: 'bg-red-400',
    },
    {
      id: 5,
      title: 'Calculo Volume 1',
      category: 'Material de Estudos',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Calculo+2',
      statusColor: 'bg-red-400',
    },
    {
      id: 6,
      title: 'Iphone 8',
      category: 'Tecnologia',
      price: '35.000',
      seller: 'Paulo Combo',
      img: 'https://via.placeholder.com/250x200?text=iPhone+8+2',
      statusColor: 'bg-green-400',
    },
    {
      id: 7,
      title: 'Calculo Volume 1',
      category: 'Livros',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Livro+3',
      statusColor: 'bg-red-400',
    },
    {
      id: 8,
      title: 'Calculo Volume 1',
      category: 'Livros',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Livro+4',
      statusColor: 'bg-red-400',
    },
    {
      id: 9,
      title: 'Calculo Volume 1',
      category: 'Material de Estudos',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Calculo+3',
      statusColor: 'bg-red-400',
    },
    {
      id: 10,
      title: 'Iphone 8',
      category: 'Tecnologia',
      price: '35.000',
      seller: 'Paulo Combo',
      img: 'https://via.placeholder.com/250x200?text=iPhone+8+3',
      statusColor: 'bg-green-400',
    },
    {
      id: 11,
      title: 'Calculo Volume 1',
      category: 'Livros',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Livro+5',
      statusColor: 'bg-red-400',
    },
    {
      id: 12,
      title: 'Calculo Volume 1',
      category: 'Livros',
      price: '5.000',
      seller: 'Maria Candidato',
      img: 'https://via.placeholder.com/250x200?text=Livro+6',
      statusColor: 'bg-red-400',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* hero/banner */}
      <section className="pt-7 pb-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-[#EDE7FF] rounded-2xl px-7 py-8 md:py-9 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="text-left max-w-md">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2C1A4A] leading-tight">
                Faça Parte Do Primeiro Marketplace Para Estudantes
              </h1>
              <p className="text-sm text-gray-600 mt-3 mb-5">
                Compre e venda com segurança entre estudantes — rápido, simples e
                confiável.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button className="bg-[#4B187C] hover:bg-[#3E1367] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm no-underline">
                  Compra Já
                </button>
              </div>
            </div>

            <div className="w-full md:w-auto flex justify-center">
              <img
                src={heroImg}
                alt="Estudantes felizes fazendo compras"
                className="w-full max-w-sm md:max-w-md object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* filters bar */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Condição', icon: null },
              { label: 'Preço', icon: null },
              { label: 'Avaliações', icon: <Star className="w-3 h-3" /> },
              { label: 'Select', icon: null },
            ].map((item) => (
              <button
                key={item.label}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-xs md:text-sm flex items-center gap-2 text-gray-700 border border-gray-200"
              >
                {item.icon ? <span className="text-gray-500">{item.icon}</span> : null}
                <span>{item.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            ))}
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-xs md:text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Todos os filtros</span>
            </button>
          </div>
          <div className="mt-1 md:mt-0">
            <select className="border border-gray-200 rounded-full px-4 py-2 text-xs md:text-sm text-gray-700 bg-white">
              <option>Ordenar Por</option>
            </select>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 pb-12 pt-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900">
          Produtos em Destaque
        </h2>
        <ProductGrid products={sampleProducts} />
      </section>
    </div>
  );
};

export default Home;
