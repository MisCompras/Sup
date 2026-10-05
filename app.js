// app.js - Versión 7.0 Enterprise Security Edition - MODIFICADO
// Ingeniería: Fusión de Motor QuaggaJS (Estable) + Mejoras UX/UI + Seguridad SHA-256 Modal + Base de Datos Ampliada
// Estado: Código de Producción Unificado.
// Fecha de modificación: [Fecha actual] - Correcciones de estado en selector de productos

const STORAGE_PRODUCTS = 'products_v6';
const STORAGE_LISTS = 'lists_v6';
const STORAGE_THEME = 'settings_theme_v6';
const STORAGE_FONT_SIZE = 'settings_font_size_v6';
const STORAGE_SCALE = 'settings_scale_v6';

// --- CONFIGURACIÓN DEL PORTAL SEGURO (Actualizada) ---
const PORTAL_CONFIG = [
    { name: 'RunTime TV',     url: 'https://www.runtime.tv/app',                                   icon: '📺', method: 'iframe'   },
    { name: 'TV Garden',      url: 'https://tv.garden/',                                           icon: '📺', method: 'iframe'   },
    { name: 'LaCartoons',     url: 'https://lacartoons.com/',                                      icon: '📺', method: 'iframe'   },
    { name: 'YouTube',        url: 'https://www.youtube.com/results?search_query=tv+en+vivo',      icon: '▶️', method: 'external' },
    { name: 'Radios Arg',     url: 'https://www.radios-argentinas.org/',                           icon: '📻', method: 'iframe'   },
    { name: 'Pluto TV',       url: 'https://pluto.tv/latam/live-tv',                               icon: '📺', method: 'external' },
    { name: 'News.net.ar',    url: 'https://news.net.ar/',                                         icon: '📰', method: 'iframe'   },
    { name: 'Wikipedia',      url: 'https://es.wikipedia.org/',                                    icon: '📚', method: 'iframe'   },
    { name: 'Google',         url: 'https://www.google.com/webhp?igu=1',                           icon: '🔍', method: 'external' },
    { name: 'El País',        url: 'https://elpais.com/',                                          icon: '📰', method: 'external' },
    { name: 'Clarín',         url: 'https://www.clarin.com/',                                      icon: '📰', method: 'external' },
    { name: 'Página 12',      url: 'https://www.pagina12.com.ar/',                                 icon: '📰', method: 'external' },
    { name: 'TN Noticias',    url: 'https://tn.com.ar/',                                           icon: '📺', method: 'external' },
    { name: 'A24',            url: 'https://www.a24.com/',                                         icon: '📺', method: 'external' },
    { name: 'Spotify Web',    url: 'https://open.spotify.com/',                                    icon: '🎵', method: 'external' },
    { name: 'Google Maps',    url: 'https://www.google.com/maps',                                  icon: '🗺️', method: 'external' },
    { name: 'WhatsApp Web',   url: 'https://web.whatsapp.com/',                                    icon: '💬', method: 'external' },
    { name: 'Gmail',          url: 'https://mail.google.com/',                                     icon: '📧', method: 'external' },
    { name: 'Traductor',      url: 'https://translate.google.com/',                                icon: '🌍', method: 'external' },
    { name: 'Drive',          url: 'https://drive.google.com/',                                    icon: '📁', method: 'external' }
];

// SEGURIDAD: Credenciales actualizadas (admin / 1234) SHA-256
const SECURE_USER_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
const SECURE_PASS_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
let isPortalAuthenticated = false;

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const uuid = () => {
  if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

let pendingChanges = false;
let currentListId = null;
let lastActionBlocker = null;

// Detección de dispositivo
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

// Aplicar clase de dispositivo al body
const applyDeviceClass = () => {
  if (isMobileDevice()) {
    document.body.classList.add('mobile');
    document.body.classList.remove('desktop');
  } else {
    document.body.classList.add('desktop');
    document.body.classList.remove('mobile');
  }
};

/* ---------- Clasificador de Productos AVANZADO (Base de Datos Ampliada) ---------- */
const ProductCategorizer = (() => {
  let sortedKeywords = [];
  let categoryCache = new Map();

  // KeywordMap expandido con la base de datos de appno.js
  const keywordMap = {
  'Alimentos Básicos y Despensa': ['arroz','garbanzos','avena','sésamo','soja','vinagre de vino','trigo pelado','postre','té en saq','té menta','té verde','sal entrefina','relleno bon o bon','relleno fondue','provenzal','pasta de maní','pimentón','nutella','poroto','maíz pisingallo','manzanilla','orégano','maíz','maíz blanco','fideo 3 vegetales','lenteja','harina 0000','harina común','jardinera','laurel','fideo letras','fideo mostachol','fideo spaghetti','fideo tallarín','fideo tirabuzón','fideo ave maría','fideo dedalito','aceto balsámico','don satur','boldo','condimento para hamburguesas','condimento para empanadas','condimento para carne a la parrilla','caldo carne','caldo verdura','caldo gallina','arvejas partidas','aceto balsámico original','aceto balsámico frutos rojos','aceto balsámico clásico','aceto balsámico 500ml','fideos secos','harina de trigo','harina leudante','harina integral','azúcar','Azúcar DUL-C','Azúcar Ledesma','Azúcar fronterita','sal fina','sal gruesa','aceite','aceite de girasol','aceite de oliva','aceite mezcla','vinagre al alcohol','vinagre de manzana','aceto balsámico','salsa de tomate','puré de tomate','mayonesa','mostaza','kétchup','savora','caldo en cubos','caldo líquido','sopas instantáneas','especias','pimienta','orégano','condimento para pizza','azafrán','comino','coco rallado','pimentón','chimichurri','ají molido','canela','nuez moscada','curry','esencia de vainilla','levadura seca','levadura fresca','gelatina','flan en polvo','flan','albahaca','postres en polvo','budín en caja','miel','edulcorante','polvo de hornear','maizena','polenta','avena','vinagre manzana','bicarbonato de sodio','bicarbonato','bizcochuelo','arroz inflado','lentejas secas','garbanzos secos','porotos secos','puré de papas instantáneo','yerba mate','café molido','café instantáneo','té en saquitos','mate cocido','chocolino','cacao en polvo','cebada','cereales de desayuno','café','dulce membrillo','dulce de membrillo','dulce zapallo','dulce ciruela','dulce de batata y chocolate','dulce de batata','dulce durazno','mate en saquito 25unid','mate en saquito 50unid','dulce pera','café molido','fideos','azúcar','Almidón de Maíz Maizena 500g','Arroz Doble Carolina Dos Hnos Paq 1 kg','Arroz Largo Fino Dos Hnos. Paq 1 Kgm','Arroz Largo Fino Lucchetti 1kg','Arroz Parboil Gallo Oro 1kg','Arvejas Secas Arcor 300 grm','Arvejas Secas Marolio Remojadas Tetra 340 g.','Fideos Coditos Terrabusi 500g','Fideos Dedalitos Terrabusi 500 g.','Fideos Fusilli Mix de Vegetales Terrabusi 500g','Fideos Fusilli Terrabusi 500g','Fideos Mostachol Rayados Terrabusi 500g','Fideos Penne Rigate N 45 3 Vegetales Matarazzo 500g','Fideos Soperos Sémola Terrabusi Ave María 500 grm','Fideos Soperos Sémola Munición Terrabusi 500 gr','Fideos Spaghetti N°3 Terrabusi 500g','Fideos Tallarín N° 7 Terrabusi 500g','Fideos Tallarines Clásicos DI PASCUALLE 500gr','Fideos Tallarines Espinaca DI PASCUALLE 500gr','Fideos Tirabuzón N34 3 Vegetales Matarazzo 500g','Flan Sabor Vainilla Exquisita Sob 40 grm','Dulce de Leche Repostero La Serenísima 400g','Dulce Leche Colonial La Serenísima 400g','Dulce Leche Estilo Colonial La Serenísima 1 kg','Dulce Leche La Serenísima Clásico Fuente de Calcio 400 gr','Gelatina Light Sabor Cereza Exquisita 25g','Gelatina Light Sabor Durazno Exquisita 25g','Gelatina Light Sabor Frutilla Exquisita 25g','Gelatina Sabor Cereza Exquisita 40g','Gelatina Sabor Durazno Exquisita 40g','Gelatina Sabor Frambuesa Exquisita 40g','Gelatina Sabor Frutilla Exquisita 40g','Gelatina Sabor Naranja Exquisita 40g','Harina de Maíz para Preparar Polenta Egran 1kg','Maggi Caldo Equilibrium Verdura x 12u.','Maíz Egran Pisingallo Bsa 500 grm','Polenta Instantánea Egran Bolsa x 500 Grs','Postre Sabor Dulce de Leche Exquisita 80 grm','Postre Vainilla Exquisita 80 grm','Postre Vainilla Light Exquisita Sob 50 grm','CEBADA EL POCILLO DOY PACK X 170 GR.','Malta El Pocillo 200gr','Mate Cocido La Tranquera 50 saq','Mate Cocido Tradicional x25 Saquitos','Té La Virginia clásico 50 saquitos','TÉ NEGRO LA VIRGINIA 50saq.','Yerba Más Sabor Compuesta x 1kg','Yerba Más Sabor Compuesta x 500gr','Yerba Más Sabor con Boldo x 500gr','Yerba Más Sabor con Cedrón x 500gr','Yerba Más Sabor con Menta x 500gr','Yerba Más Sabor con Naranja x 500gr','Yerba Más Sabor con Peperina x 500gr'],
  'Panadería y Repostería': ['pan francés','pan de molde','pastel','pan de hamburguesas','pan de pancho','pan negro tostado','pan negro','pan tostado','pan','medialuna','factura','criollo','dona','cupcake','pan lactal','pan de salvado','pan integral','facturas','medialunas','torta','tarta','bizcochuelo','budín','galletitas dulces','galletitas saladas','alfajor casero','churro','masa para tarta','masa de hojaldre','prepizza','pan rallado','criollitos','grisines','bizcochos','donas','cupcakes','pasteles','budines','roscas','alfajor dulce de leche','pan dulce','stollen','pan árabe','tortillas santiagueñas','Bizcochuelo Sabor Coco Exquisita 540g','Bizcochuelo Sabor Limón Exquisita 540g','Bizcochuelo Sabor Naranja Exquisita 540g','Bizcochuelo Sabor Vainilla Exquisita 540g','Bizcochuelo Sabor Vainilla Sin Gluten Exquisita 450g'],
  'Lácteos y Huevos': ['leche entera','huevo blanco','queso cremoso','queso','huevo de color','leche larga vida','leche larga vida entera','leche larga vida deslac','leche larga vida desc','leche descremada','leche chocolatada','chocolatada','leche condensada','leche evaporada','leche en polvo','yogur bebible','yogur firme','queso fresco','queso rallado','queso sardo','queso tybo','mozzarella','ricota','queso crema','queso untable','queso azul','queso pategrás','crema de leche','manteca','margarina','yogur','yogur frutilla','yogur durazno','yogur vainilla','yogur multifrutal','yogur banana','yogur arándano','dulce de leche','huevos','Leche Clásica Más Liviana La Serenísima Botella Larga Vida 1l','Leche con Hierro La Serenisina Botella Larga Vida 1l','Leche Descremada Larga Vida Barista La Serenísima 1 ltr','Leche Descremada Menos Calorías La Serenísima Botella Larga Vida 1l','Leche Entera Clásica La Serenísima Botella Larga Vida 1l','Leche Entera Clásica La Serenísima Sachet 1l','Leche Extra Calcio La Serenisina Botella Larga Vida 1l','Leche La Serenísima con Prebióticos 1l','Leche Larga Vida Entera Ua Clásica 3% La Serenísima 1l','Leche Larga Vida Parcialmente Descremada Liviana 1% La Serenísima 1l','Leche Multidefensas 1% La Serenísima Sachet 1l','Leche Multidefensas 2% La Serenísima Sachet 1l','Leche Parcialmente Descremada Liviana La Serenísima 1% 1l','Leche Parcialmente Descremada Liviana La Serenísima Botella Larga Vida 1l','Leche Parcialmente Descremada Liviana La Serenísima Larga Vida 1l','Leche Protein La Serenisina Botella Larga Vida 1l','Leche Zero Lactosa La Serenísima Botella Larga Vida 1l','Manteca La Paulina 100gr','Manteca La Paulina 200gr','Yogur Descremado Ilolay Frutilla Bebible 1kg','Yogur Descremado Ilolay Vainilla Bebible 1kg','Yogur Entero Ilolay Frutilla Bebible 1kg','Yogur Entero Ilolay Vainilla Bebible 900g','Yogur Ilolay Durazno Sachet x 900gr','Yogur Ilolay Frutilla Sachet x 900gr','Yogur Ilolay Frutilla y Kiwi Sachet x 900gr','Yogur Ilolay Vainilla Sachet x 900gr','Yogur Milkaut Durazno Sachet x 900gr','Yogur Milkaut Frutilla Sachet x 900gr','Yogur Milkaut Vainilla Sachet x 900gr','Yogurt Manfrey Banana x 900gr','Yogurt Manfrey Durazno x 900gr','Yogurt Manfrey Vainilla x 900gr'],
  'Carnes, Aves y Pescados': ['carne lomo','vacío','milanesas','pollo','pescado','pata de pollo','pata muslo','hígado','costeleta','cuadril','colita de cuadril','carne molida','chorizo','bocado ancho','bocado fino','chorizo cerdo','chorizo pollo','asado','vacío','matambre','entraña','costilla','nalga','cuadrada','bola de lomo','peceto','roast beef','osobuco','falda','paleta','pollo entero','pechuga de pollo','muslo de pollo','alita de pollo','cordero','bondiola de cerdo','carré de cerdo','solomillo de cerdo','pescado fresco','merluza','salmón','atún','caballa','sardina','calamar','camarón','camarón','mariscos','moluscos','mondongo','hígado','riñón','morcilla','chinchulín','mollejas'],
  'Embutidos y Fiambres': ['salchichas','mortadela','jamón cocido','jamón crudo','panceta','bacon','salame','bondiola fiambre','longaniza','hamburguesas procesadas','paté'],
  'Frutas y Verduras': ['manzana','carbón','ananá','sandía','rúcula','melón','mazorca','limón','granadina','cereza','ajo','cabeza de ajo','brócolis','naranja','arándanos','banana','pera','durazno','ciruela','uva','frutilla','cereza','kiwi','ananá','melón','sandía','limón','mandarina','pomelo','mango','mora','frambuesa','coco','palta','tomate','cebolla','papa','batata','zanahoria','lechuga','espinaca','acelga','rúcula','achicoria','brócoli','coliflor','berenjena','zapallo','calabaza','choclo','arveja fresca','chaucha','pepino','pimiento','morrón','alcachofa','espárrago','hongo','champiñón','jengibre','perejil','apio','puerro','rabanito','remolacha','repollo','zapallitos','palmitos frescos','nuez'],
  'Refrigerados y Frescos': ['ravioles','panqueques','tapa de empanadas','tapa emp árabe','pascualina','levadura en polvo','levadura','ñoquis','fideos frescos','fideo fresco huevo','fideo fresco morón','fideos frescos morrón','fideo fresco espinaca','tapas de empanadas','tartas preparadas','ensaladas listas','aderezos refrigerados','crema pastelera','postres refrigerados','Fideos Frescos DANAL 500gr','Ravioles Jamón y Queso DI PASCUALLE 1kg','Ravioles Pollo y Verdura DI PASCUALLE 500gr','Tapa para Empanada Freír DI PASCUALLE 12u','Tapa para Empanada Árabes DI PASCUALLE 12u','Tapa Pascualina Criolla DANAL 2u','Tapa Pascualina Criolla DI PASCUALLE 2u','Tapa Pascualina Hojaldre DI PASCUALLE 2u','tapas empanadas horno di pascualle 300 gr 12u','Tapas para Empanada Horno DANAL 12u','Tapas para Empanadas Árabes DANAL 12u','Levadura Fresca Calsa 50 gr','Levadura Fresca Calsa 50 gr x 2 Unidades','Levadura Fresca Prensada Calsa 50 g.','Levadura Prensada Levex en Cubito 50 g.','Levadura Seca Calsa Mi Pan 10 gr','Levadura Seca Levex 10g 2 Unidades','Levaduras con Masa Madre Levex 13g','Ñoquis DI PASCUALLE 500gr'],
  'Congelados': ['helado','hamburguesas congeladas','patitas de pollo congeladas','pescado congelado (filet)','papas fritas congeladas','vegetales congelados','masas de tarta congeladas','pizzas congeladas','empanadas congeladas','tartas congeladas'],
  'Enlatados y Conservas': ['atún en lata','pickle','frutos secos','porotos remojado','garbanzos remojado','palmitos','anchoas','champiñones','arvejas','durazno al natural','picadillo de carne','puré de tomate','pulpa de tomate','pimiento - morrones','aceituna negra','sardina en lata','caballa en lata','merluza en lata','arvejas en lata','choclo en lata','choclo cremoso','choclo grano','tomate en lata','durazno en almíbar','ananá en almíbar','peras en almíbar','picles','picle','aceitunas','hongos en lata','jardinera en lata','lentejas en lata','garbanzos en lata','palmitos en lata','Arvejas Cumana 300gr','Choclo Amarillo en Granos Inalpa 300 grm','Pulpa de Tomate Baggio 7dias'],
  'Snacks y Golosinas': ['alfajores','granola','pepas','magdalenas','vainillas','frolitas','galleta 7 semillas','galleta surtida','galleta','salvado x1','galleta de salvado','galletas agridulce','galletas de salvado','galletas de sésamo','vocación x3','almohaditas rellenas','Cereales Copos de Maíz','tita','maní confitado','tatin triple','tatin','sonrisas','rodesia','papitas','polvorita chocolate','polvorita vainilla','polvorita','oblea de frutilla','oblea de limón','oblea de vainilla','oblea','oblea de dulce de leche','oblea de chocolate','merengadas','maní','mana rellenas','mana x3','confites de maní','lincoln','magdalenas','flow cereales','formis','frutigram','chupetín','alfajor','chocolate confitado','chocolates','caramelo','chupetines','gomitas','turrón','turrón de maní','turrón','chizitos','doritos','papas fritas (bolsa)','palitos salados','pipas','maní','garrapiñadas','barritas de arroz','barritas de cereal','tutucas','saladix','mantecol','chicles','galletas pepas','obleas','galletitas','galletas de agua','pastillas','titas','rhodesia','gall.salvado . Hogareñas Pak 600 grm','gall.salvado . Hogareñas Paq 200 grm','Galletita Rellena de Chocolate Mana 152 gr','Galletitas Crackers 7 Semillas Hogareñas','Galletitas Crackers 7 Semillas Hogareñas Paq 567 grm','Galletitas Crackers con Sésamo Hogareñas 167 grm','Galletitas Crackers Mix de Cereales Hogareñas','Galletitas Crackers Mix de Cereales Hogareñas','Galletitas de Chocolate Rellenas de Vainilla Polvorita 152g','Galletitas Dulces Clásicas Vocación 141g','Galletitas Polvorita Vainilla Rellenas Frutilla 81 g.','Galletitas Polvorita Vainilla Rellenas Vainilla 81 g.','galletitas rellenas 152g','Galletitas Rellenas Sabor Chocolate Polvorita 81gr','Galletitas vainilla rell limón Maná 152 g.','Galletitas vocación Acarameladas','Pepas Membrillo Trio Paq 500 grm'],
  'Bebidas e Infusiones': ['agua mineral con gas','jugos refrigerados','jugo de granadina','jugo en caja manzana','jugo en caja 125ml','jugo naranja banana','jugo ananá','tang naranja','tang naranja mango','tang pera','jugo naranja','jugo pomelo','jugo limón','jugo limonada - arándanos','jugo en caja naranja','agua','agua mineral','soda','gaseosas cola','gaseosas lima-limón','gaseosas naranja','coca cola','pepsi','7up','sprite','pritty','terma','tang','jugos en polvo','jugos en botella','energizantes','cerveza','vino tinto','vino blanco','champagne','champán','sidra','fernet','vodka','whisky','ron','licores','sabirizada','gaseosa','fanta','mirinda','doble cola','aperitivos','agua saborizada','agua saborizada manzana','agua saborizada limón','agua saborizada lima limón','agua saborizada naranja','terma','terma manzana','terma pomelo rosado','agua saborizada pera','Gaseosa Coca-cola Sabor Original 1,25 lt','Gaseosa Coca-cola Sabor Original 2,25 lt','Gaseosa Coca-cola Sabor Original 3 lt','Gaseosa Cola Pepsi 2l','Gaseosa Cola Pepsi 2l','Gaseosa Crush Sin Azúcar Naranja 2,25 lt','Gaseosa Doble Cola Botella 2.25 l','GASEOSA DOBLE COLA BOTELLA X 3 L','Gaseosa Fanta Pomelo 1,75 lt','Gaseosa Lima Limón 7 Up Regular Pet 3 lts','Gaseosa Manzana Crush Pet 3 l.','Gaseosa Naranja Fanta 3 lts','Gaseosa Naranja Regular Crush Pet 3 l.','Gaseosa Paso de Los Toros Pomelo Botella 1.5 l','Gaseosa Pepsi Botella 3 l','Gaseosa Pepsi Botella 3 l','Gaseosa Pritty Limón Botella 1.5 l','Gaseosa Pritty Limón Botella 2.25 l','Gaseosa Pritty Zero Limón Botella 2.5 l','Gaseosa Secco Cola 2,25 lt','Gaseosa Secco Naranja 2,25 lt','Gaseosa Secco Pomelo 2,25 lt','Gaseosa Seven Up Botella 2.25 l','Gaseosa Seven Up Botella 2.25 l','Gaseosa Seven Up Sin Azúcar Botella 2.25 l','Jugo en Polvo Clight Ananá 7g','Jugo en Polvo Clight Limonada 8 g','Jugo en Polvo Clight Limonada Maracuyá 7,5g','Jugo en Polvo Clight Limonada Rosa 8g','Jugo en Polvo Clight Mandarina 8g','Jugo en Polvo Clight Manzana Deliciosa 7g','Jugo en Polvo Clight Manzana Verde 7,5g','Jugo en Polvo Clight Naranja 8 g','Jugo en Polvo Clight Naranja Durazno 7,5g','Jugo en Polvo Clight Naranja Mango 7g','Jugo en Polvo Clight Pomelo Rosado 8 g','Jugo en Polvo en Polvo Tang Uva 15g','Jugo en Polvo Light Dia Manzana Deliciosa 7,5 gr.','Jugo en Polvo Light Dia Naranja 10 gr.','Jugo en Polvo Light Dia Pomelo 10 gr.','Jugo en Polvo Tang Ananá 15g','Jugo en Polvo Tang Durazno 15g','Jugo en Polvo Tang Limonada Dulce 15g','Jugo en Polvo Tang Manzana 15g','Jugo en Polvo Tang Multifruta 15g','Jugo en Polvo Tang Naranja 15g','Jugo en Polvo Tang Naranja Banana 15g','Jugo en Polvo Tang Naranja Dulce 15g','Jugo en Polvo Tang Naranja Durazno 15g','Jugo en Polvo Tang Naranja Lima 15g','Jugo en Polvo Tang Naranja Mango 15g','Jugo en Polvo Tang Pomelo Rosado 15g','Jugo en Polvo Tang Sabor Pera 15g'],
  'Limpieza del Hogar': ['detergente','escobillón','espiral','fuentón','palo','palo de piso','cepillo inodoro','guantes de látex','saphirus','limpiador desinfectante de piso','limpiador vidrios y multiuso','toallón','toalla de mano','quitamanchas en polvo','limpia inodoro','paño multiuso','limpia vidrio','limpia baño','guante','desodorante piso','desodorante de ambiente','lavandina','jabón en polvo','jabón líquido para ropa','jabón líquido ropa','suavizante','suavizante ropa','vivere','alcohol para quemar','alcohol en gel (limpieza)','desinfectante de pisos','limpiavidrios','limpiamuebles','limpia baño','limpia cocina','antigrasa','insecticida','raid','esponja','escoba','pala','secador de piso','trapo de piso','balde','rejilla','virulana','bolsa de basura','cif','jabón ropa','k-hotrina','naftalina','sopapa','guantes de limpieza','cepillo de inodoro','limpiador multiuso','Detergente Ala Cremoso Limón 750 cc.','Detergente Concentrado Limón Ala 300ml','Detergente Concentrado Limón Ala 450ml','Detergente Concentrado Océano Ala 300ml','Detergente Concentrado Océano Ala 500ml','Detergente Concentrado Pomelo Ala 300ml','Jabón Líquido Ala Matic para Diluir 500ml','Jabón Líquido con Bicarbonato Ala Matic 500ml','Pack Jabón Líquido para Diluir + Ala Bid 500 ml'],
  'Higiene y Cuidado Personal': ['papel higiénico','paleta de sombras','cepillo de pelo','polvo comp cara','lápiz delineador de cejas','tampones','rubor compacto','hebillas para el cabello','pinzas para el cabello','labial','toallitas desmaquillantes','máscara de pestañas','crema de peinar','esmalte de uñas','esmalte protector','delineador de labios','delineador de ojos','crema para manos','cera depilatoria','clip invisible largo para pelo','vincha para pelo','toallas femeninas','protectores diarios','peine','jabón dove','servilletas','jabón','jabón líquido','jabón líquido','gomita de pelo','rollo de cocina','servilletas de papel','servilletas','toalla femenina','protector diario','tampón','pañal','toallita húmeda','algodón','hisopo','cepillo de dientes','pasta dental','enjuague bucal','hilo dental','desodorante (aerosol/roll-on)','perfume','colonia','crema corporal','crema facial','protector solar','repelente de insectos','off','talco','jabón de tocador','shampoo','acondicionador','máquina de afeitar','prestobarba','espuma de afeitar','quitaesmalte','pañuelo descartable','Acondicionador Sedal Crema Balance Repuesto 300 cc.','Acondicionador Balance Plusbelle Bot 1000 ml','Acondicionador Brillo Plusbelle Bot 1000 ml','Acondicionador Ese Largo Saludable Plusbelle 970 ml','Acondicionador Esencia Control Fizz Plusbelle Bot 970 ml','Acondicionador Esencia Fuerza Reparadora Plusbelle Bot 970 ml','Acondicionador Esencia Hidratación Intensa Plusbelle 970ml','Acondicionador Esencia Restauración Plusbelle Bot 970 ml','Acondicionador Esencia Frescura Plusbelle Bot 970 ml','Acondicionador Frescura Plusbelle Bot 1000 ml','Acondicionador Fuerza Antioxidante Plusbelle 1l','Acondicionador Nutrición Plusbelle Bot 1000 ml','Acondicionador Protección Plusbelle Bot 1000 ml','Acondicionador Sedal Ceramidas Repuesto 300 cc.','Acondicionador Sedal Restauración Repuesto 300 cc.','Acondicionador Suavidad Plusbelle Bot 1000 ml','Acondicionador Vitalidad Plusbelle Bot 1000 ml','Crema Dental 4 en 1 Oral B Cja 70 grm','Crema Dental Gum Avengers Pomo 100 gr','Crema Dental Gum Whitening Plus Pomo 100 gr','Crema Dental Max White Colgate Cja 180 grm','Crema Dental Miraculous Gum 100g','crema dental Trolls Gum Pom 100 gr','Crema Dental Whitening Gum Cja 120 grm','Crema para Peinar Hialurónico Vitamina A Sedal 300ml','Gel Dental Advancedcare Gum 100g','Hilo Dental Gum Expanding Floss Blister 40 Metros','Jabón Tocador Esencia con Glicerina Plusbelle 120 grm','Jabón Tocador Esencia con Leche de Arroz Plusbelle 120 grm','Jabón Tocador Esencia con Leche de Arroz Plusbelle 360 grm','Jabón Tocador Esencia con Miel Plusbelle 120 grm','Jabón Tocador Vita Glicerina Balance Plusbelle x 120 grm','Jabón Tocador Vita Glicerina Frescura 3x Plusbelle x 360 grm','Jabón Tocador Vita Glicerina Nutrición Plusbelle x 120 grm','PAPEL HIGIÉNICO OLIMPO 4 X 80','Pasta Dental Colgate Max Blanqueadora 180g','Pasta dental Colgate máxima protección anticaries 180 grs','Pasta dental Colgate máxima protección anticaries 90 grs','Pasta Dental Colgate Original 180g','Pasta Dental Colgate Protección Anticaries 90g','Pasta Dental Colgate Triple Beneficio 180 g','Pasta Dental Colgate Triple Beneficio Blanqueador 140 g','Polvo Pedico Efficient Fresh Rexona 100 grm','Polvo Pedico Efficient Fresh Rexona Tar 200 grm','Polvo Pedico Efficient Original Rexona 100 grm','Polvo Pedico Efficient Original Rexona 200 grm','Shampoo Brillo Plusbelle Bot 1000 ml','Shampoo Esencia Largo Saludable Plusbelle 970 ml','Shampoo Esencia Restauración Plusbelle Bot 970 ml','Shampoo Frescura Plusbelle Bot 1000 ml','Shampoo Fuerza Antioxidante Plusbelle 1l','Shampoo Nutrición Plusbelle Bot 1000 ml','Shampoo Sedal Ceramidas Repuesto 300 cc.','Shampoo Sedal Restauración Repuesto 300 cc.','Rollo de cocina maxi rollo Felpita x 200 paños'],
  'Farmacia y Primeros Auxilios': ['analgésico','complemento de vitaminas','toallas húmedas antibacteriales','curitas','alcohol','base iluminadora','vitamina c','desodorante niño','desodorante f','desodorante h','desodorante antitranspirante en gel','crema cuerpo','crema dental','crema dental niño','cepillo de diente niño','cepillo de diente','antitranspirante roll on h','antitranspirante roll on m','antiinflamatorio','algodón','antifebril','manteca de cacao','vendas','gasas','termómetro','ibuprofeno','paracetamol','digestivo','vitaminas','pastillas para la garganta','sales rehidratantes','preservativos','antitusivo','antihistamínico','alcohol en gel aloe vera','alcohol en gel','alcohol gel','alcohol spray','alcohol spray 100ml','alcohol spray 500ml','alcohol','agua oxigenada'],
  'Librería y Papelería': ['cuaderno','sacapunta metal','lápices de colores','regla-esc-transp','plastilina','crayón','fibra','goma','crayón gruesos','compás','hojas a4','cinta de empaquetar','lápiz','lapicera','goma de borrar','sacapuntas','marcadores','resaltador','carpeta','separadores','adhesivo (plasticola/voligoma)','tijera','cinta scotch','mochila','cartuchera','blocks de notas','correctores','calculadora de mano','resmas de papel','acuarela','tempera','plasticola','voligoma','cartulina','fibron','folio','papel afiche','forro cuaderno/carpeta'],
  'Hogar y Bazar': ['bombilla eléctrica','tetera','almohada','banqueta plegable','incienso en varillas','manguera','reposera','palillos de madera','conservadora','ensaladera','papel aluminio','espumadera','espátula','espátula ancha','espátula para untar','cucharita','azucarera','copa','bols','lámpara led','aromatizante de ambientes','pila aaa','pila aa','pila c','pila d2','papel aluminio','bols de basura','broche ropa','vela','fósforos','encendedor','pilas','termo','mate','olla','sartén','cuchillo','tenedor','cuchara','vaso','plato','taza','bowl','fuente de horno','abrelatas','colador','carbón','film','fósforos','film autoadherente','papel aluminio','linterna','luz de emergencia','percha','broche para ropa','jarra','tupperware'],
  'Ferretería': ['wd-40','reflector','foco led','poxi-ran','manguera','poxi-ran 250','la gotita','cinta aisladora'],
  'Comida Rápida': ['lomito','pizzas','coffee','taco','tacos','hamburguesa','panchos','empanadas'],
  'Mascotas': ['alimento para perro seco','alimento para perro húmedo','osspret shampoo y enjuague para perros','alimento para gato seco','alimento para gato húmedo','arena sanitaria','juguetes para mascota','correa','shampoo para mascotas','golosinas para perro','antipulgas','comida para perro','comida para perro tie','comida para perro sab']
  };

  const allCategories = Object.keys(keywordMap).concat('Otros');

  function init() {
    const allKeywords = [];
    for (const category in keywordMap) {
      keywordMap[category].forEach(keyword => {
        allKeywords.push({
          key: keyword.toLowerCase(),
          cat: category
        });
      });
    }
    sortedKeywords = allKeywords.sort((a, b) => b.key.length - a.key.length);
  }

  function categorize(productName) {
    if (categoryCache.has(productName)) {
      return categoryCache.get(productName);
    }

    const normName = productName.toLowerCase();
    for (const item of sortedKeywords) {
      if (normName.includes(item.key)) {
        categoryCache.set(productName, item.cat);
        return item.cat;
      }
    }
    
    const result = 'Otros';
    categoryCache.set(productName, result);
    return result;
  }

  function getCategoryForProduct(product) {
    if (product.category && product.category !== 'Otros') {
      return product.category;
    }
    return categorize(product.name);
  }

  function getAllCategories() {
    return [...allCategories];
  }

  function setProductCategory(product, category) {
    product.category = category;
    categoryCache.set(product.name, category);
  }

  init();

  return {
    categorize: categorize,
    getCategoryForProduct: getCategoryForProduct,
    getAllCategories: getAllCategories,
    setProductCategory: setProductCategory
  };
})();

/* ---------- Funciones Criptográficas ---------- */
// Función para generar SHA-256 (moderno y seguro)
async function sha256(source) {
    const sourceBytes = new TextEncoder().encode(source);
    const digest = await crypto.subtle.digest("SHA-256", sourceBytes);
    const resultBytes = [...new Uint8Array(digest)];
    return resultBytes.map(x => x.toString(16).padStart(2, '0')).join('');
}

/* ---------- Inicialización ---------- */
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', applyDeviceClass);

function init() {
  applyDeviceClass();
  applyStoredSettings(); // Aplicar tema/fuente/escala guardados
  setupNav();
  route();
  window.addEventListener('hashchange', () => { route(); highlightNav(); });
  setupConfirmModal();
  setupSettingsModal(); // Configurar nuevo modal de settings
  setupLoginModal(); // INGENIERÍA: Inicializar modal de login seguro
  initCalculator();
  updateProductCountInNav();
  setupGlobalImageFallback();
  setupImageReportModal();
  highlightNav();
  window.addEventListener('orientationchange', applyDeviceClass);
}

/* ---------- Navegación ---------- */
function setupNav() {
  $('#btn-products').addEventListener('click', () => tryNavigate('#products'));
  $('#btn-lists').addEventListener('click', () => tryNavigate('#lists'));
  $('#btn-games').addEventListener('click', () => tryNavigate('#games'));
  
  // LOGICA DEL PORTAL MEJORADA (UX: Modal en vez de Prompt)
  $('#btn-portal').addEventListener('click', () => {
      if (isPortalAuthenticated) {
          tryNavigate('#portal');
      } else {
          // Abrir modal de login y enfocar input
          $('#login-modal').classList.remove('hidden');
          setTimeout(() => $('#login-user').focus(), 100);
      }
  });
}

// Configuración del Modal de Login (Asíncrono y seguro - Upgrade 7.0)
function setupLoginModal() {
    const modal = $('#login-modal');
    const userIn = $('#login-user');
    const passIn = $('#login-pass');
    
    $('#close-login').addEventListener('click', () => modal.classList.add('hidden'));
    
    const performLogin = async () => {
        const user = userIn.value;
        const pass = passIn.value;
        
        const userHash = await sha256(user);
        const passHash = await sha256(pass);
        
        if (userHash === SECURE_USER_HASH && passHash === SECURE_PASS_HASH) {
            isPortalAuthenticated = true;
            modal.classList.add('hidden');
            userIn.value = '';
            passIn.value = '';
            alert("✅ Acceso Concedido. Bienvenido al sistema seguro.");
            tryNavigate('#portal');
        } else {
            alert("❌ Credenciales incorrectas.\nPruebe con: admin / 1234");
            passIn.value = '';
        }
    };

    $('#btn-login-submit').addEventListener('click', performLogin);
    
    // Permitir Enter para login
    passIn.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') performLogin();
    });
}

function tryNavigate(route) {
  if (pendingChanges) {
    showConfirm('Cambios o productos seleccionados se perderán. ¿Continuar?', () => {
      pendingChanges = false;
      location.hash = route;
    });
  } else {
    location.hash = route;
  }
}

function route() {
  const app = $('#app');
  const hash = location.hash || '#products';
  
  // Protección de ruta manual
  if (hash === '#portal' && !isPortalAuthenticated) {
      location.hash = '#products';
      return;
  }

  app.innerHTML = '';
  if (hash === '#products') renderProductsView(app);
  else if (hash === '#lists') renderListsView(app);
  else if (hash === '#portal') renderPortalView(app);
  else if (hash === '#games') renderGamesView(app);
  else { location.hash = '#products'; renderProductsView(app); }
  highlightNav();
}

/* ---------- Renderizado del Portal (Mejorado) ---------- */
/* ---------- Renderizado del Portal (v8.0 Robusto) ---------- */
function renderPortalView(container) {
    const tpl = document.getElementById('template-portal').content.cloneNode(true);
    container.appendChild(tpl);
    const btnContainer = container.querySelector('#portal-buttons-container');
    const iframe = container.querySelector('#portal-frame');
    const placeholder = container.querySelector('#portal-placeholder');
    const loadingEl = container.querySelector('#portal-loading');
    const blockedEl = container.querySelector('#portal-blocked');
    const blockedText = container.querySelector('#portal-blocked-text');
    const blockedOpen = container.querySelector('#portal-blocked-open');
    const toolbar = container.querySelector('#portal-toolbar');
    const currentTitle = container.querySelector('#portal-current-title');
    const reloadBtn = container.querySelector('#portal-reload');
    const openExtBtn = container.querySelector('#portal-open-external');
    const closeBtn = container.querySelector('#btn-close-portal');

    let currentSite = null;
    let loadTimer = null;

    function resetViewer() {
        if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
        iframe.classList.add('hidden');
        iframe.src = 'about:blank';
        blockedEl.classList.add('hidden');
        loadingEl.classList.add('hidden');
        placeholder.classList.remove('hidden');
        toolbar.hidden = true;
        currentTitle.textContent = '—';
    }
    function markActive(btn) {
        btnContainer.querySelectorAll('.portal-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    }
    function loadSite(site, btn) {
        currentSite = site;
        markActive(btn);
        if (site.method === 'external') {
            window.open(site.url, '_blank', 'noopener');
            currentTitle.textContent = site.name + ' (abierto en pestaña nueva)';
            toolbar.hidden = false;
            placeholder.classList.add('hidden');
            loadingEl.classList.add('hidden');
            iframe.classList.add('hidden');
            blockedText.textContent = '"' + site.name + '" bloquea la incrustación por seguridad (X-Frame-Options / CSP). Se abrió en una pestaña nueva.';
            blockedEl.classList.remove('hidden');
            return;
        }
        toolbar.hidden = false;
        currentTitle.textContent = (site.icon || '') + ' ' + site.name;
        placeholder.classList.add('hidden');
        blockedEl.classList.add('hidden');
        loadingEl.classList.remove('hidden');
        iframe.classList.remove('hidden');
        iframe.src = 'about:blank';
        setTimeout(() => { iframe.src = site.url; }, 80);
        if (loadTimer) clearTimeout(loadTimer);
        loadTimer = setTimeout(() => {
            loadingEl.classList.add('hidden');
            blockedText.textContent = '"' + (currentSite ? currentSite.name : '') + '" no respondió o bloqueó la incrustación. Intente con "Abrir fuera".';
            blockedEl.classList.remove('hidden');
        }, 9000);
    }

    iframe.addEventListener('load', () => {
        if (!currentSite || currentSite.method === 'external') return;
        try {
            const href = iframe.contentWindow.location.href;
            if (href === 'about:blank') return;
        } catch (e) {
            // Origen cruzado => la página real cargó correctamente
            if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
            loadingEl.classList.add('hidden');
            blockedEl.classList.add('hidden');
            return;
        }
        // Mismo origen accesible => página de error (sitio bloqueado)
        if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
        loadingEl.classList.add('hidden');
        blockedText.textContent = '"' + (currentSite ? currentSite.name : '') + '" rechaza mostrarse aquí (X-Frame-Options). Use apertura externa.';
        blockedEl.classList.remove('hidden');
        iframe.classList.add('hidden');
    });

    reloadBtn.addEventListener('click', () => {
        if (currentSite) loadSite(currentSite, btnContainer.querySelector('.portal-btn.active'));
    });
    openExtBtn.addEventListener('click', () => { if (currentSite) window.open(currentSite.url, '_blank', 'noopener'); });
    blockedOpen.addEventListener('click', () => { if (currentSite) window.open(currentSite.url, '_blank', 'noopener'); });

    PORTAL_CONFIG.forEach(site => {
        const btn = document.createElement('button');
        btn.className = 'portal-btn';
        btn.type = 'button';
        const arrow = site.method === 'external' ? '↗' : '➡';
        btn.innerHTML = '<span>' + (site.icon || '') + ' ' + escapeHtml(site.name) + '</span><small>' + arrow + '</small>';
        btn.addEventListener('click', () => loadSite(site, btn));
        btnContainer.appendChild(btn);
    });

    closeBtn.addEventListener('click', () => {
        isPortalAuthenticated = false;
        resetViewer();
        location.hash = '#products';
    });
    resetViewer();
}

/* ---------- Helpers de Storage ---------- */
function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS);
    const products = raw ? JSON.parse(raw) : [];
    
    products.forEach(product => {
      if (!product.category) {
        product.category = ProductCategorizer.categorize(product.name);
      }
    });
    
    return products;
  } catch (e) {
    console.error('Error loading products:', e);
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  updateProductCountInNav();
}

function loadLists() {
  try {
    const raw = localStorage.getItem(STORAGE_LISTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading lists:', e);
    return [];
  }
}

function saveLists(lists) {
  localStorage.setItem(STORAGE_LISTS, JSON.stringify(lists));
}

function updateProductCountInNav() {
  try {
    const btn = document.getElementById('btn-products');
    if (!btn) return;
    const products = loadProducts();

    let countSpan = btn.querySelector('.nav-count');
    if (!countSpan) {
      countSpan = document.createElement('span');
      countSpan.className = 'nav-count';
      btn.appendChild(countSpan);
    }
    countSpan.textContent = `(${products.length})`;
  } catch (e) {
    console.error("Failed to update nav count:", e);
  }
}

/* ---------- Modal de Confirmación ---------- */
function setupConfirmModal() {
  const modal = $('#confirm-modal');
  $('#confirm-cancel').addEventListener('click', () => {
    modal.classList.add('hidden');
    lastActionBlocker = null;
  });
  $('#confirm-ok').addEventListener('click', () => {
    modal.classList.add('hidden');
    if (typeof lastActionBlocker === 'function') lastActionBlocker();
    lastActionBlocker = null;
  });
}

function showConfirm(text, okCallback) {
  lastActionBlocker = okCallback;
  $('#confirm-text').textContent = text;
  $('#confirm-modal').classList.remove('hidden');
}

/* ---------- Modal de Configuración (MEJORADO) ---------- */

function applyStoredSettings() {
  const theme = localStorage.getItem(STORAGE_THEME) || 'light';
  const fontSize = localStorage.getItem(STORAGE_FONT_SIZE) || 'medium';
  const scale = localStorage.getItem(STORAGE_SCALE) || '1'; // NUEVO
  setTheme(theme);
  setFontSize(fontSize);
  setScale(scale); // NUEVO
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(STORAGE_THEME, theme);
  
  // Actualizar botones activos en el modal
  $$('#theme-selector .setting-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function setFontSize(fontSize) {
  document.documentElement.dataset.fontSize = fontSize; // Aplicar al <html>
  localStorage.setItem(STORAGE_FONT_SIZE, fontSize);

  // Actualizar botones activos en el modal
  $$('#font-size-selector .setting-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.fontSize === fontSize);
  });
}

// NUEVA FUNCIÓN PARA ESCALA
function setScale(scale) {
  document.body.style.zoom = scale;
  localStorage.setItem(STORAGE_SCALE, scale);

  // Actualizar botones activos
  $$('#scale-selector .setting-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scale === scale);
  });
}

function setupSettingsModal() {
  const modal = $('#settings-modal');
  $('#btn-settings').addEventListener('click', () => modal.classList.remove('hidden'));
  $('#close-settings').addEventListener('click', () => modal.classList.add('hidden'));

  // Lógica de Temas
  $('#theme-selector').addEventListener('click', (e) => {
    if (e.target.matches('.setting-btn')) {
      setTheme(e.target.dataset.theme);
    }
  });

  // Lógica de Tamaño de Fuente
  $('#font-size-selector').addEventListener('click', (e) => {
    if (e.target.matches('.setting-btn')) {
      setFontSize(e.target.dataset.fontSize);
    }
  });

  // NUEVO: Lógica de Escala
  $('#scale-selector').addEventListener('click', (e) => {
    if (e.target.matches('.setting-btn')) {
      setScale(e.target.dataset.scale);
    }
  });

  // --- Lógica de Backup/Restore (Movida aquí) ---

  // Backup Productos (Upgrade 7.0 Versioning)
  $('#btn-backup-prod').addEventListener('click', () => {
    const data = {
      products: loadProducts(),
      version: '7.0',
      timestamp: new Date().toISOString(),
      totalProducts: loadProducts().length
    };
    downloadJSON(data, `backup_productos_${new Date().toISOString().slice(0,10)}.json`);
    alert(`✅ Backup creado: ${data.totalProducts} productos guardados`);
  });

  // Restaurar Productos
  $('#btn-restore-prod').addEventListener('click', () => {
    showConfirm('¿Restaurar backup de productos? Se perderán los productos actuales.', () => {
      const input = $('#file-input');
      input.onchange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        try {
          const text = await f.text();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.products)) {
            saveProducts(parsed.products);
            alert(`✅ Backup restaurado: ${parsed.products.length} productos cargados`);
            modal.classList.add('hidden');
            tryNavigate('#products'); // Navegar para refrescar
          } else {
            alert('❌ Archivo inválido: No se encontraron productos');
          }
        } catch (err) {
          alert('❌ Error leyendo archivo: Formato JSON inválido');
        }
        input.value = '';
      };
      input.click();
    });
  });

  
  // Backup Listas de Compras
  $('#btn-backup-lists').addEventListener('click', () => {
    const data = {
      lists: loadLists(),
      version: '7.0',
      timestamp: new Date().toISOString(),
      totalLists: loadLists().length
    };
    downloadJSON(data, `backup_listas_${new Date().toISOString().slice(0,10)}.json`);
    alert(`✅ Backup creado: ${data.totalLists} listas guardadas`);
  });

  // Restaurar Listas de Compras
  $('#btn-restore-lists').addEventListener('click', () => {
    showConfirm('¿Restaurar backup de listas de compras? Se perderán las listas actuales.', () => {
      const input = $('#file-input');
      input.onchange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        try {
          const text = await f.text();
          const parsed = JSON.parse(text);
          // Aceptar tanto { lists: [...] } como [...] 
          if (Array.isArray(parsed.lists)) {
            saveLists(parsed.lists);
            alert(`✅ Backup restaurado: ${parsed.lists.length} listas cargadas`);
            modal.classList.add('hidden');
            tryNavigate('#lists');
          } else if (Array.isArray(parsed)) {
            saveLists(parsed);
            alert(`✅ Backup restaurado: ${parsed.length} listas cargadas`);
            modal.classList.add('hidden');
            tryNavigate('#lists');
          } else {
            alert('❌ Archivo inválido: No se encontraron listas');
          }
        } catch (err) {
          alert('❌ Error leyendo archivo: Formato JSON inválido');
        }
        input.value = '';
      };
      input.click();
    });
  });

  // Backup Completo
  $('#btn-backup-all').addEventListener('click', () => {
    const data = {
      products: loadProducts(),
      lists: loadLists(),
      version: '7.0',
      timestamp: new Date().toISOString(),
      totalProducts: loadProducts().length,
      totalLists: loadLists().length
    };
    downloadJSON(data, `backup_completo_${new Date().toISOString().slice(0,10)}.json`);
    alert(`✅ Backup completo creado: ${data.totalProducts} productos y ${data.totalLists} listas guardadas`);
  });

  // Restaurar Completo
  $('#btn-restore-all').addEventListener('click', () => {
    showConfirm('¿Restaurar backup completo? Se perderán todos los datos actuales.', () => {
      const input = $('#file-input');
      input.onchange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        try {
          const text = await f.text();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.products) && Array.isArray(parsed.lists)) {
            saveProducts(parsed.products);
            saveLists(parsed.lists);
            currentListId = null;
            alert(`✅ Backup completo restaurado: ${parsed.products.length} productos y ${parsed.lists.length} listas cargadas`);
            updateProductCountInNav(); // Actualizar contador
            modal.classList.add('hidden');
            tryNavigate('#lists'); // Navegar para refrescar
          } else {
            alert('❌ Archivo inválido: Estructura de backup incorrecta');
          }
        } catch (err) {
          alert('❌ Error leyendo archivo: Formato JSON inválido');
        }
        input.value = '';
      };
      input.click();
    });
  });
}


/* ---------- Vista de Productos (MEJORADA con selector de categorías y campo código) ---------- */
function renderProductsView(container) {
  const tpl = document.getElementById('template-products').content.cloneNode(true);
  container.appendChild(tpl);
  const listEl = container.querySelector('#product-list');
  const formArea = container.querySelector('#product-form-area');
  const btnSelectAll = container.querySelector('#btn-select-all-prod');

  function updateSelectAllButtonState() {
    const checkboxes = listEl.querySelectorAll('li input[type=checkbox]');
    if (checkboxes.length === 0) {
      btnSelectAll.textContent = '🔲 Seleccionar Todo';
      btnSelectAll.disabled = true;
      return;
    }

    btnSelectAll.disabled = false;
    const allSelected = Array.from(checkboxes).every(cb => cb.checked);
    btnSelectAll.textContent = allSelected ? '🔳 Deseleccionar Todo' : '🔲 Seleccionar Todo';
  }

  function refreshList() {
    listEl.innerHTML = '';
    const data = loadProducts();

    if (data.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">No hay productos cargados</div>';
      updateSelectAllButtonState();
      return;
    }

    const productsByCategory = new Map();
    data.forEach(p => {
      const category = ProductCategorizer.getCategoryForProduct(p);
      if (!productsByCategory.has(category)) {
        productsByCategory.set(category, []);
      }
      productsByCategory.get(category).push(p);
    });

    const sortedCategories = [...productsByCategory.keys()].sort();

    sortedCategories.forEach(category => {
      const header = document.createElement('li');
      header.className = 'admin-category-header';
      header.innerHTML = `
        <span>${category}</span>
        <small>(${productsByCategory.get(category).length} productos)</small>
      `;
      listEl.appendChild(header);

      const products = productsByCategory.get(category);
      products.forEach(p => {
        const li = document.createElement('li');
        li.dataset.id = p.id;
        li.innerHTML = `
          <input class="checkbox-cell" type="checkbox" />
          <img src="${p.image || placeholderImage(p.name)}" alt="${escapeHtml(p.name)}" />
          <div class="item-meta">
            <div class="name">${escapeHtml(p.name)}</div>
            <div class="sub">${p.unit} · $${p.price.toFixed(2)} · ${p.category} ${p.code ? '· 🔢: ' + p.code : ''}</div>
          </div>
        `;
        li.querySelector('.checkbox-cell').addEventListener('change', updateSelectAllButtonState);
        listEl.appendChild(li);
      });
    });

    updateSelectAllButtonState();
  }
  
  refreshList();

  container.querySelector('#btn-add-product')?.addEventListener('click', () => renderProductForm(null));

  container.querySelector('#btn-mod-prod').addEventListener('click', () => {
    const sel = Array.from(listEl.querySelectorAll('li'))
      .filter(li => li.querySelector('input[type=checkbox]'))
      .filter(li => li.querySelector('input[type=checkbox]').checked)
      .map(li => li.dataset.id);

    if (sel.length !== 1) {
      alert('Seleccione exactamente 1 producto para modificar');
      return;
    }

    const prod = loadProducts().find(x => x.id === sel[0]);
    if (!prod) {
      alert('Producto no encontrado');
      return;
    }
    renderProductForm(prod);
  });

  container.querySelector('#btn-del-prod').addEventListener('click', () => {
    const sel = Array.from(listEl.querySelectorAll('li'))
      .filter(li => li.querySelector('input[type=checkbox]'))
      .filter(li => li.querySelector('input[type=checkbox]').checked)
      .map(li => li.dataset.id);

    if (sel.length === 0) {
      alert('Seleccione 1 o más productos para borrar');
      return;
    }

    showConfirm(`¿Confirma borrar ${sel.length} producto(s)?`, () => {
      let data = loadProducts().filter(p => !sel.includes(p.id));
      saveProducts(data);
      let lists = loadLists().map(list => {
        list.items = list.items.filter(it => !sel.includes(it.productId));
        return list;
      });
      saveLists(lists);
      refreshList();
      formArea.innerHTML = '';
      alert(`✅ ${sel.length} producto(s) eliminado(s) correctamente`);
    });
  });

  btnSelectAll.addEventListener('click', () => {
    const checkboxes = listEl.querySelectorAll('li input[type=checkbox]');
    if (checkboxes.length === 0) return;
    const allSelected = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => { cb.checked = !allSelected; });
    updateSelectAllButtonState();
  });

  /* ---------- CARGA INTELIGENTE DE ASSETS (Lógica Mejorada de appno.js) ---------- */
  container.querySelector('#btn-update-from-assets').addEventListener('click', () => {
    showConfirm(`Esto intentará cargar 'assets/manifest.json'. ¿Desea continuar?`,
      async () => {
        const originalContent = listEl.innerHTML;
        let loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = 'Procesando...';
        loadingIndicator.style.cssText = 'padding: 40px; text-align: center;';
        listEl.innerHTML = '';
        listEl.appendChild(loadingIndicator);

        try {
          const response = await fetch('assets/manifest.json');
          if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
          const manifestData = await response.json();
          
          if (!Array.isArray(manifestData)) throw new Error("Formato inválido");

          let products = loadProducts();
          const existingNames = new Set(products.map(p => p.name.toLowerCase()));
          const productsToAdd = [];
          const DEFAULT_PRICE = 1.00;

          manifestData.forEach(item => {
            const name = item.name ? item.name.trim() : '';
            if (!name) return;

            // Evitar duplicados por nombre
            if (!existingNames.has(name.toLowerCase())) {
                const imagePath = item.image && item.image.trim() ? item.image.trim() : `assets/${name}.png`;
                const parsedPrice = typeof item.price === 'number' ? item.price : DEFAULT_PRICE;

                const newProd = {
                    id: uuid(),
                    name: name,
                    unit: 'Cantidad',
                    price: parsedPrice,
                    image: imagePath,
                    category: ProductCategorizer.categorize(name),
                    code: item.code || '',
                    createdAt: new Date().toISOString()
                };

                productsToAdd.push(newProd);
                existingNames.add(name.toLowerCase());
            } 
          });

          if (productsToAdd.length > 0) {
            products = [...productsToAdd, ...products];
            saveProducts(products);
          }

          refreshList();
          alert(`✅ Actualización completada: ${productsToAdd.length} productos nuevos.`);

        } catch (err) {
          console.error(err);
          alert(`❌ Error al actualizar.`);
          listEl.innerHTML = originalContent;
          updateSelectAllButtonState();
        }
      }
    );
  });

  // --- Lógica de Backup/Restore movida a setupSettingsModal() ---

  container.querySelector('#btn-verify-images').addEventListener('click', verifyProductImages);

  function renderProductForm(product) {
    formArea.innerHTML = '';
    const isNew = !product;
    const card = document.createElement('div');
    card.className = 'form-card';
    card.innerHTML = `
      <h3>${isNew ? '➕ Agregar Producto' : '✏️ Modificar Producto'}</h3>
      <div class="form-row">
        <label>📷 Foto</label>
        <input type="file" id="prod-image" accept="image/*" />
        <img id="preview-img" />
      </div>
      <div class="form-row">
        <label>📛 Nombre de Prod</label>
        <input id="prod-name" type="text" placeholder="Nombre del producto" />
      </div>
      <div class="form-row">
        <label>🔢 Código</label>
        <input id="prod-code" type="text" placeholder="Código de barras" />
        <button id="btn-scan-code" class="btn" style="background: #4CAF50;">📷 Escanear</button>
      </div>
      <div class="form-row">
        <label>📂 Categoría</label>
        <select id="prod-category">
          ${ProductCategorizer.getAllCategories().map(cat => 
            `<option value="${cat}">${cat}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-row">
        <label>📏 Unidad</label>
        <select id="prod-unit">
          <option>Litros</option>
          <option>Kg</option>
          <option selected>Cantidad</option>
        </select>
        <label>💰 Precio</label>
        <input id="prod-price" type="number" step="0.01" min="0" placeholder="0.00" />
      </div>
      <div class="form-actions">
        <button id="save-prod" class="btn">💾 ${isNew ? 'Guardar' : 'Actualizar'}</button>
        <button id="cancel-prod" class="btn secondary">❌ Cancelar</button>
        ${!isNew ? '<button id="re-categorize" class="btn warning">🔄 Recategorizar Automáticamente</button>' : ''}
      </div>
    `;
    formArea.appendChild(card);

    const imgInput = card.querySelector('#prod-image');
    const preview = card.querySelector('#preview-img');
    const nameInput = card.querySelector('#prod-name');
    const codeInput = card.querySelector('#prod-code');
    const categoryInput = card.querySelector('#prod-category');
    const unitInput = card.querySelector('#prod-unit');
    const priceInput = card.querySelector('#prod-price');
    const scanBtn = card.querySelector('#btn-scan-code');
    let currentImage = product ? product.image : null;

    preview.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:12px;margin-left:12px;border:2px solid var(--line);';

    if (product) {
      nameInput.value = product.name;
      codeInput.value = product.code || '';
      categoryInput.value = product.category || ProductCategorizer.categorize(product.name);
      unitInput.value = product.unit;
      priceInput.value = product.price;
      preview.src = currentImage || placeholderImage(product.name);
    } else {
      preview.src = placeholderImage('');
      nameInput.addEventListener('input', () => {
        if (nameInput.value.trim()) {
          const autoCategory = ProductCategorizer.categorize(nameInput.value);
          categoryInput.value = autoCategory;
        }
      });
    }

    // Evento para escanear código (USANDO QUAGGA ESTABLE DE APP.JS)
    scanBtn.addEventListener('click', () => {
      openBarcodeScanner((scannedCode) => {
        codeInput.value = scannedCode;
        // Feedback visual
        codeInput.style.backgroundColor = '#d1fae5'; // verde claro
        setTimeout(() => codeInput.style.backgroundColor = '', 1000);
      });
    });

    imgInput.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) {
        alert('❌ Solo se permiten archivos de imagen');
        return;
      }
      const dataUrl = await fileToDataURL(f);
      currentImage = dataUrl;
      preview.src = dataUrl;
      const fileName = f.name.replace(/\.[^/.]+$/, "");
      if (!product && (!nameInput.value || nameInput.value.trim() === '')) {
        nameInput.value = fileName;
        const autoCategory = ProductCategorizer.categorize(fileName);
        categoryInput.value = autoCategory;
      }
    });

    card.querySelector('#cancel-prod').addEventListener('click', () => {
      formArea.innerHTML = '';
    });

    if (!isNew) {
      card.querySelector('#re-categorize').addEventListener('click', () => {
        const autoCategory = ProductCategorizer.categorize(nameInput.value);
        categoryInput.value = autoCategory;
        alert(`✅ Producto recategorizado a: ${autoCategory}`);
      });
    }

    card.querySelector('#save-prod').addEventListener('click', () => {
      const name = nameInput.value.trim();
      const code = codeInput.value.trim();
      const category = categoryInput.value;
      const unit = unitInput.value;
      const price = parseFloat(priceInput.value);

      if (!name) { alert('❌ Nombre requerido'); return; }
      if (isNaN(price) || price < 0) { alert('❌ Precio inválido'); return; }

      let products = loadProducts();

      if (product) {
        const idx = products.findIndex(p => p.id === product.id);
        if (idx === -1) { alert('❌ Producto no encontrado'); return; }
        products[idx] = {
          ...products[idx],
          name,
          code,
          category,
          unit,
          price,
          image: currentImage,
          updatedAt: new Date().toISOString()
        };
      } else {
        products.unshift({
          id: uuid(),
          name,
          code,
          category,
          unit,
          price,
          image: currentImage,
          createdAt: new Date().toISOString()
        });
      }

      saveProducts(products);
      refreshList();
      formArea.innerHTML = '';
      alert(isNew ? '✅ Producto agregado' : '✅ Producto modificado');
    });
  }

  refreshList();
}

/* ---------- Vista de Listas (MEJORADA con escáner de código de barras) ---------- */
function renderListsView(container) {
  const tpl = document.getElementById('template-lists').content.cloneNode(true);
  container.appendChild(tpl);

  const dropdown = container.querySelector('#lists-dropdown');
  const detailArea = container.querySelector('#list-detail-area');
  
  // Agregar evento al icono de cámara en el header
  const cameraIcon = container.querySelector('#btn-scan-barcode-header');
  cameraIcon.addEventListener('click', () => {
    if (!currentListId) {
      alert('❌ Primero seleccione una lista');
      return;
    }
    openBarcodeScannerForList();
  });

  function refreshDropdown() {
    const lists = loadLists();
    dropdown.innerHTML = '';
    const optEmpty = document.createElement('option');
    optEmpty.value = '';
    optEmpty.textContent = '-- Seleccione lista --';
    dropdown.appendChild(optEmpty);
    lists.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = l.name;
      dropdown.appendChild(opt);
    });
    // --- MODIFICACIÓN (Task 1): Asegurar que el valor se establezca ---
    // Si currentListId es null, se seleccionará automáticamente la opción vacía
    dropdown.value = currentListId || '';
  }

  refreshDropdown();

  dropdown.addEventListener('change', (e) => {
    const newId = e.target.value || null;
    if (pendingChanges) {
      showConfirm('Cambios o productos seleccionados se perderán. ¿Continuar?', () => {
        pendingChanges = false;
        openList(newId);
      });
    } else {
      openList(newId);
    }
  });

  container.querySelector('#btn-new-list').addEventListener('click', () => {
    const name = prompt('📝 Nombre de la nueva lista:');
    if (!name || !name.trim()) return;
    const lists = loadLists();
    if (lists.some(l => l.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      alert('❌ Ya existe una lista con ese nombre');
      return;
    }
    const newList = {
      id: uuid(),
      name: name.trim(),
      items: [],
      createdAt: new Date().toISOString()
    };
    lists.unshift(newList);
    saveLists(lists);
    currentListId = newList.id;
    refreshDropdown();
    openList(newList.id);
  });

  container.querySelector('#btn-del-list').addEventListener('click', () => {
    const id = dropdown.value;
    if (!id) {
      alert('❌ Seleccione una lista');
      return;
    }
    showConfirm('¿Confirma borrar la lista seleccionada?', () => {
      const lists = loadLists().filter(l => l.id !== id);
      saveLists(lists);
      currentListId = null;
      detailArea.innerHTML = '';
      refreshDropdown();
      alert('✅ Lista eliminada correctamente');
    });
  });

  // --- Lógica de Backup/Restore movida a setupSettingsModal() ---

  function openList(listId) {
    currentListId = listId;
    refreshDropdown(); // Asegura que el dropdown refleje el ID actual
    detailArea.innerHTML = '';
    if (!listId) return;
    const lists = loadLists();
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    renderListDetail(list);
  }

  function renderListDetail(list) {
    detailArea.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'form-card';
    card.innerHTML = `
      <div class="list-header">
        <h3>${escapeHtml(list.name)}</h3>
        <div class="list-actions">
          <button id="btn-add-items" class="btn">➕ Agregar</button>
          <button id="btn-clear-selections" class="btn secondary">🔲 Limpiar</button>
          <button id="btn-delete-items" class="btn danger">🗑️ Borrar</button>
          <button id="btn-finish" class="btn success">📋 Fin de compra</button>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat"><small>⏳ Faltan</small><div id="stat-missing">0</div></div>
        <div class="stat"><small>✅ Completado</small><div id="stat-completed">0</div></div>
        <div class="stat"><small>💰 Total</small><div id="stat-total">$0.00</div></div>
      </div>
      <div class="list-search-container">
        <input type="text" id="list-filter-input" placeholder="Buscar producto o categoría..." />
        <button id="list-filter-mic" class="list-filter-mic-btn" aria-label="Buscar por voz">🎤</button>
        <button id="list-filter-clear" class="list-filter-clear-btn" aria-label="Limpiar búsqueda">✖</button>
      </div>
      <div id="list-items"></div>
    `;
    detailArea.appendChild(card);
    
    const itemsContainer = card.querySelector('#list-items');
    const filterInput = card.querySelector('#list-filter-input');
    const filterClearBtn = card.querySelector('#list-filter-clear');
    const filterMicBtn = card.querySelector('#list-filter-mic'); // Botón de micrófono

    filterInput.addEventListener('input', () => {
      renderRows(filterInput.value);
    });

    filterClearBtn.addEventListener('click', () => {
      filterInput.value = '';
      renderRows('');
    });
    
    // --- Lógica de SpeechRecognition (para filtro de lista) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let recognitionTimeout = null;

    if (!SpeechRecognition) {
      filterMicBtn.style.display = 'none';
    } else {
      filterMicBtn.addEventListener('click', startDictation);
    }
    
    function startDictation() {
      if (recognition && recognition.isListening) {
        recognition.stop();
        return;
      }

      try {
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.isListening = true;

        recognition.onstart = () => {
          filterMicBtn.classList.add('listening');
          filterMicBtn.textContent = '...';
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          filterInput.value = transcript;
          renderRows(transcript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            alert('Permiso de micrófono denegado. Revise la configuración de su navegador.');
          }
        };

        recognition.onend = () => {
          clearTimeout(recognitionTimeout);
          if (filterMicBtn) {
             filterMicBtn.classList.remove('listening');
             filterMicBtn.textContent = '🎤';
          }
          if (recognition) {
              recognition.isListening = false;
              recognition = null;
          }
        };
        
        recognition.start();

        recognitionTimeout = setTimeout(() => {
          if (recognition && recognition.isListening) {
            recognition.stop();
          }
        }, 6000);

      } catch (e) {
         console.error("Error al iniciar la API de reconocimiento:", e);
         if (e.name === 'NotAllowedError') {
             alert('Permiso de micrófono denegado. Revise la configuración de su navegador.');
         }
         if (filterMicBtn) {
             filterMicBtn.classList.remove('listening');
             filterMicBtn.textContent = '🎤';
         }
         if (recognition) {
             recognition.isListening = false;
             recognition = null;
         }
      }
    }
    // --- FIN Lógica de SpeechRecognition ---

    function renderRows(filter = '') {
      itemsContainer.innerHTML = '';
      const products = loadProducts();
      const normFilter = filter.toLowerCase().trim();

      if (list.items.length === 0) {
        itemsContainer.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">No hay productos en esta lista</div>';
        recalc();
        return;
      }

      const itemsByCategory = new Map();
      let filteredItemCount = 0;
      
      list.items.forEach(it => {
        const prod = products.find(p => p.id === it.productId);
        const category = prod ? ProductCategorizer.getCategoryForProduct(prod) : 'Otros';
        
        if (normFilter) {
          const productName = prod ? prod.name.toLowerCase() : '';
          const categoryName = category.toLowerCase();
          if (!productName.includes(normFilter) && !categoryName.includes(normFilter)) {
            return;
          }
        }
        
        filteredItemCount++;

        if (!itemsByCategory.has(category)) {
          itemsByCategory.set(category, []);
        }
        itemsByCategory.get(category).push({ item: it, product: prod });
      });

      if (filteredItemCount === 0 && list.items.length > 0) {
        itemsContainer.innerHTML = `<div style="text-align:center;padding:40px;color:#666;">No se encontraron productos para "${escapeHtml(filter)}"</div>`;
        recalc();
        return;
      }

      const sortedCategories = [...itemsByCategory.keys()].sort();

      sortedCategories.forEach(category => {
        const header = document.createElement('div');
        header.className = 'list-category-header';
        header.innerHTML = `
          <span>${category}</span>
          <small>(${itemsByCategory.get(category).length} productos)</small>
        `;
        itemsContainer.appendChild(header);

        const categoryItems = itemsByCategory.get(category);
        
        // --- MODIFICACIÓN (Task 6): Ordenar ítems dentro de la categoría ---
        // done: false (pendientes) van primero, done: true (completados) van al final.
        categoryItems.sort((a, b) => {
            return (a.item.done === b.item.done) ? 0 : a.item.done ? 1 : -1;
        });
        // --- FIN MODIFICACIÓN ---

        categoryItems.forEach(({ item, product }) => {
          const priceVal = (item.price !== undefined && item.price !== null) ? item.price : (product ? product.price : 0);
          const row = document.createElement('div');
          row.className = `list-row ${item.done ? 'completed' : 'pending'}`;
          row.dataset.pid = item.productId;
          // --- MODIFICACIÓN PRINCIPAL: Reordenar la estructura según ejemplo.png ---
          row.innerHTML = `
            <div class="left-block">
              <input type="checkbox" class="left-select" ${item.done ? 'checked' : ''} />
              <img src="${(product && product.image) ? product.image : placeholderImage(product?.name || '')}" />
              <div class="product-info">
                <div class="product-name">${escapeHtml(product?.name || 'Producto eliminado')}</div>
                <div class="product-details">
                  <div class="price-editor">
                    <strong>Precio:</strong> 
                    <input type="number" class="price-input" min="0" step="0.01" value="${priceVal.toFixed(2)}" />
                    <button class="price-clear-btn" aria-label="Borrar precio">✖</button>
                  </div>
                  <div class="quantity-section">
                    <strong>Cantidad:</strong>
                    <div class="quantity-stepper">
                      <button class="qty-btn" data-action="decrease" aria-label="Disminuir cantidad">-</button>
                      <input type="number" class="qty-input" min="0" max="99" value="${item.qty || 0}" />
                      <button class="qty-btn" data-action="increase" aria-label="Aumentar cantidad">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="right-block">
              <div class="subtotal-box">Total Prod: $${((item.qty || 0) * priceVal).toFixed(2)}</div>
            </div>
          `;
          // --- FIN MODIFICACIÓN PRINCIPAL ---
          itemsContainer.appendChild(row);
        });
      });
      
      recalc();
    }

    card.querySelector('#btn-add-items').addEventListener('click', () => {
      openMultiProductPicker(list, () => {
        const updatedLists = loadLists();
        const updated = updatedLists.find(l => l.id === list.id);
        if (updated) { list.items = updated.items; }
        renderRows(filterInput.value);
      });
    });

    card.querySelector('#btn-clear-selections').addEventListener('click', () => {
      const checkboxes = itemsContainer.querySelectorAll('.left-select');
      let clearedCount = 0;
      checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
          checkbox.checked = false;
          // Disparar evento input para guardar el cambio y re-renderizar
          checkbox.dispatchEvent(new Event('input', { bubbles: true }));
          clearedCount++;
        }
      });
      
      if (clearedCount > 0) {
        alert(`✅ ${clearedCount} selección(es) limpiada(s)`);
      } else {
        alert('ℹ️ No hay elementos seleccionados para limpiar');
      }
    });

    card.querySelector('#btn-delete-items').addEventListener('click', () => {
      const selectedItems = Array.from(itemsContainer.querySelectorAll('.list-row'))
        .filter(row => row.querySelector('.left-select').checked)
        .map(row => row.dataset.pid);
      if (selectedItems.length === 0) {
        alert('❌ Seleccione al menos un producto para borrar');
        return;
      }
      showConfirm(`¿Está seguro de que desea eliminar ${selectedItems.length} producto(s) de la lista?`, () => {
        const lists = loadLists();
        const currentListIndex = lists.findIndex(l => l.id === list.id);
        if (currentListIndex !== -1) {
          lists[currentListIndex].items = lists[currentListIndex].items.filter(
            item => !selectedItems.includes(item.productId)
          );
          saveLists(lists);
          list.items = lists[currentListIndex].items;
          renderRows(filterInput.value);
          alert(`✅ ${selectedItems.length} producto(s) eliminado(s) correctamente`);
        }
      });
    });

    card.querySelector('#btn-finish').addEventListener('click', () => {
      if (list.items.length === 0) { alert('❌ La lista está vacía'); return; }
      
      // --- MODIFICACIÓN (Task 4): Forzar guardado antes de exportar ---
      // La lógica de guardado ahora es síncrona en 'list.items', solo necesitamos
      // asegurarnos de que el 'saveTimer' no tenga nada pendiente,
      // pero es más seguro guardar la lista actual 'list.items'
      // antes de proceder.
      const lists = loadLists();
      const currentListIndex = lists.findIndex(l => l.id === list.id);
      if (currentListIndex !== -1) {
        lists[currentListIndex].items = list.items;
        saveLists(lists);
      }
      // --- FIN MODIFICACIÓN ---

      const products = loadProducts();
      const completados = [];
      const pendientes = [];
      let totalCompletado = 0;
      let totalPendiente = 0;

      list.items.forEach(it => {
        const prod = products.find(p => p.id === it.productId);
        const price = (it.price !== undefined && it.price !== null) ? it.price : (prod ? prod.price : 0);
        const qty = it.qty || 0;
        const subtotal = price * qty;
        const itemData = {
          producto: prod?.name || 'Producto eliminado',
          unidad: prod?.unit || '',
          precio: price,
          cantidad: qty,
          subtotal,
          estado: it.done ? 'COMPRADO' : 'PENDIENTE'
        };
        if (it.done) {
          completados.push(itemData);
          totalCompletado += subtotal;
        } else {
          pendientes.push(itemData);
          totalPendiente += subtotal;
        }
      });
      const fecha = new Date().toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const titulo = `LISTA DE COMPRAS - ${escapeHtml(list.name)}`;
      const htmlContent = generateProfessionalExportHTML(titulo, fecha, list, completados, pendientes, totalCompletado, totalPendiente);
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const filename = `Compra_${list.name.replace(/[^\w]/g, '_')}_${new Date().toISOString().slice(0,10)}.xls`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      alert(`✅ Archivo exportado: ${filename}\n📊 Resumen: ${completados.length} comprados, ${pendientes.length} pendientes`);
    });

    itemsContainer.addEventListener('click', (e) => {
      const target = e.target;
      if (target.matches('.qty-btn')) {
        const row = target.closest('.list-row');
        if (!row) return;
        const input = row.querySelector('.qty-input');
        if (!input) return;
        let qty = parseInt(input.value) || 0;
        if (target.dataset.action === 'increase') {
          qty++;
        } else if (target.dataset.action === 'decrease') {
          qty = Math.max(0, qty - 1);
        }
        input.value = qty;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      
      // --- MODIFICACIÓN (Tarea 1 / Tarea 5): Evento para limpiar precio Y Foco ---
      if (target.matches('.price-clear-btn')) {
        const row = target.closest('.list-row');
        if (!row) return;
        const priceInput = row.querySelector('.price-input');
        if (priceInput) {
          priceInput.value = ''; // Limpiar
          priceInput.focus(); // Poner foco
          // No disparamos 'input' aquí, dejamos que 'focusout' maneje el default si es necesario
        }
        return;
      }
      // --- FIN MODIFICACIÓN ---
    });

    // --- MODIFICACIÓN (Tarea 1): Evento 'focusout' para precio default ---
    itemsContainer.addEventListener('focusout', (e) => {
        const target = e.target;
        if (target.matches('.price-input')) {
            const price = parseFloat(target.value);
            // Si está vacío, es 0, o no es un número, establecer a 1.00
            if (isNaN(price) || price <= 0) {
                target.value = '1.00';
                // Disparar el evento 'input' para que se guarde el cambio
                target.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }, true); // Usar 'true' para delegación de 'focusout'
    // --- FIN MODIFICACIÓN ---


    // --- MODIFICACIÓN (Task 4): Lógica de guardado refactorizada ---
    let saveTimer = null;
    itemsContainer.addEventListener('input', (e) => {
      const target = e.target;
      const row = target.closest('.list-row');
      if (!row) return;

      const pid = row.dataset.pid;
      const done = !!row.querySelector('.left-select').checked;
      const qty = parseInt(row.querySelector('.qty-input').value) || 0;
      const priceInput = row.querySelector('.price-input');
      const price = parseFloat(priceInput.value) || 0;

      // Actualizar UI de la fila
      if (done) {
        row.classList.add('completed');
        row.classList.remove('pending');
      } else {
        row.classList.add('pending');
        row.classList.remove('completed');
      }
      row.querySelector('.subtotal-box').textContent = `Total Prod: $${(qty * price).toFixed(2)}`;
      
      // Actualizar el objeto 'list' en memoria INMEDIATAMENTE
      const itemInList = list.items.find(i => i.productId === pid);
      if (itemInList) {
        itemInList.qty = qty;
        itemInList.price = price;
        itemInList.done = done;
      } else {
        // Esto no debería ocurrir en un 'input' de un ítem existente
        console.warn('Item no encontrado en list.items:', pid);
      }
      
      pendingChanges = true;

      // Limpiar timer de guardado anterior
      if (saveTimer) clearTimeout(saveTimer);
      
      // Iniciar un nuevo timer para persistir en localStorage
      saveTimer = setTimeout(() => {
        const lists = loadLists();
        const idx = lists.findIndex(x => x.id === list.id);
        if (idx === -1) return;

        // Guardar el array 'list.items' completo (ya actualizado en memoria)
        lists[idx].items = list.items; 

        saveLists(lists);
        pendingChanges = false;
        saveTimer = null; // Limpiar ID del timer

        // Lógica de actualización de precio en el producto maestro
        if (target.matches('.price-input')) {
          const products = loadProducts();
          const prodIndex = products.findIndex(p => p.id === pid);
          // --- MODIFICACIÓN Tarea 1: Solo actualizar si el precio es válido (> 0) ---
          if (prodIndex !== -1 && price > 0 && products[prodIndex].price !== price) {
            products[prodIndex].price = price;
            saveProducts(products);
          }
        }
        recalc(); // Recalcular totales después de guardar
      }, 500); // 500ms de debounce

      recalc(); // Recalcular totales para UI inmediata

      // --- MODIFICACIÓN (Task 6): Re-renderizar si se cambió el checkbox ---
      if (target.matches('.left-select')) {
        renderRows(filterInput.value);
      }
      // --- FIN MODIFICACIÓN ---
    });
    // --- FIN MODIFICACIÓN (Task 4) ---

    function recalc() {
      const rows = Array.from(itemsContainer.querySelectorAll('.list-row'));
      let missingCount = 0, completedCount = 0, total = 0;
      rows.forEach(r => {
        const chk = r.querySelector('.left-select');
        const qty = parseInt(r.querySelector('.qty-input').value) || 0;
        const price = parseFloat(r.querySelector('.price-input').value) || 0;
        const sub = qty * price;
        if (chk.checked) {
          completedCount += 1;
          total += sub;
        } else {
          missingCount += 1;
        }
      });
      card.querySelector('#stat-missing').textContent = missingCount;
      card.querySelector('#stat-completed').textContent = completedCount;
      card.querySelector('#stat-total').textContent = `$${total.toFixed(2)}`;
    }

    renderRows(); // Llamada inicial sin filtro
  }

  // --- MODIFICACIÓN (Task 1): Abrir lista si hay un ID, sino mostrar vacío ---
  if (currentListId) {
    openList(currentListId);
  } else {
    refreshDropdown();
  }
}

/* ---------- INGENIERÍA: SISTEMA DE ESCANEO PROFESIONAL (QuaggaJS) - PRESERVADO DE APP.JS ---------- */
function openBarcodeScanner(callback) {
  // Verificación de dependencia
  if (typeof Quagga === 'undefined') {
      alert('⚠️ Error de Dependencia: QuaggaJS no está cargado. Verifique su conexión o CDN.');
      return;
  }

  const modal = document.getElementById('barcode-scanner-modal');
  const stopBtn = document.getElementById('btn-stop-scan');
  const closeBtn = document.getElementById('close-barcode-scanner');
  
  modal.classList.remove('hidden');
  stopBtn.style.display = 'inline-block';

  // Inicialización Segura del Hardware
  Quagga.init({
      inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector('#interactive'), // Renderizar en el div específico
          constraints: {
              width: { min: 640 },
              height: { min: 480 },
              facingMode: "environment", // Prioriza cámara trasera
              aspectRatio: { min: 1, max: 2 }
          },
      },
      locator: {
          patchSize: "medium",
          halfSample: true
      },
      numOfWorkers: navigator.hardwareConcurrency || 2, // Optimización de hilos
      decoder: {
          readers: [
              "ean_reader", // EAN-13 (Estándar global retail)
              "ean_8_reader", 
              "code_128_reader", // Logística
              "upc_reader" // USA
          ] 
      },
      locate: true
  }, function(err) {
      if (err) {
          console.error("Quagga Init Error:", err);
          alert('❌ Error de Hardware: No se pudo acceder a la cámara. Asegúrese de estar en HTTPS y otorgar permisos.');
          modal.classList.add('hidden');
          return;
      }
      Quagga.start();
  });

  // Detección de código
  let lastDetectionTime = 0;
  Quagga.onDetected(function(result) {
      const code = result.codeResult.code;
      const now = Date.now();
      
      // Debounce simple para evitar lecturas múltiples instantáneas
      if (code && (now - lastDetectionTime > 1000)) {
          lastDetectionTime = now;
          
          // Validación de integridad básica (longitud)
          if (code.length >= 8) {
              // Feedback de Audio (Beep Profesional)
              try {
                  const AudioContext = window.AudioContext || window.webkitAudioContext;
                  if (AudioContext) {
                      const ctx = new AudioContext();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.type = 'sine';
                      osc.frequency.setValueAtTime(1200, ctx.currentTime);
                      gain.gain.setValueAtTime(0.1, ctx.currentTime);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.1);
                  }
              } catch(e) { console.warn("Audio feedback failed"); }

              Quagga.stop();
              modal.classList.add('hidden');
              if(callback) callback(code);
          }
      }
  });

  // Limpieza de recursos
  const stopScanner = () => {
      Quagga.stop();
      modal.classList.add('hidden');
  };

  stopBtn.onclick = stopScanner;
  closeBtn.onclick = stopScanner;
}

function openBarcodeScannerForList() {
    openBarcodeScanner((scannedCode) => {
        const products = loadProducts();
        const product = products.find(p => p.code === scannedCode);
        
        if (product) {
            const lists = loadLists();
            const list = lists.find(l => l.id === currentListId);
            if(list) {
                const existing = list.items.find(i => i.productId === product.id);
                if(existing) existing.qty = (existing.qty||1)+1;
                else list.items.push({ productId: product.id, qty: 1, price: product.price, done: false });
                
                saveLists(lists);
                // Forzar re-renderizado
                const app = $('#app'); 
                app.innerHTML = ''; 
                renderListsView(app);
                
                // Feedback visual no intrusivo
                const notification = document.createElement('div');
                notification.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#48bb78;color:white;padding:12px 24px;border-radius:30px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;font-weight:bold;";
                notification.textContent = `✅ ${product.name} Agregado`;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 2000);
            }
        } else {
            if(confirm(`⚠️ Código ${scannedCode} no reconocido.\n¿Desea ir a Productos para crearlo?`)) {
                tryNavigate('#products');
            }
        }
    });
}

/* ---------- Selector de Productos (Categorizado) - VERSIÓN CORREGIDA ---------- */
function openMultiProductPicker(list, onDone) {
  const products = loadProducts();
  if (products.length === 0) {
    alert('❌ No hay productos cargados');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal';
    // --- CORRECCIÓN: Reducir z-index para que el modal de confirmación quede adelante ---
  modal.style.zIndex = '999';
  modal.innerHTML = `
    <div class="modal-card large picker-modal">
      <div class="modal-header">
        <h4>🛒 Elegir productos</h4>
        <div class="modal-header-actions">
          <button id="picker-cancel" class="btn-picker-header danger" aria-label="Cancelar">✖</button>
          <button id="picker-add" class="btn-picker-header success" aria-label="Guardar">✔</button>
        </div>
      </div>
      
      <div class="search-bar-container">
        <input type="text" id="picker-search" placeholder="Buscar producto..." />
        <button id="picker-mic" class="list-filter-mic-btn" aria-label="Buscar por voz">🎤</button>
        <button id="picker-search-clear" class="search-clear-btn" aria-label="Limpiar búsqueda">✖</button>
      </div>
      <div id="picker-list" class="picker-list-scrollable"></div>
    </div>
  `;
  document.body.appendChild(modal);
  const container = modal.querySelector('#picker-list');
  const searchInput = modal.querySelector('#picker-search');
  const searchClearBtn = modal.querySelector('#picker-search-clear');
  const searchMicBtn = modal.querySelector('#picker-mic');
  
  // --- NUEVO: SISTEMA DE ESTADO GLOBAL MEJORADO ---
  const existingMap = new Map(list.items.map(item => [item.productId, item]));
  
  // Estado global que persiste durante toda la sesión del picker
  const productStateMap = new Map();
  
  // Inicializar estado para TODOS los productos
  products.forEach(p => {
    const existingItem = existingMap.get(p.id);
    productStateMap.set(p.id, {
      checked: existingItem ? true : false,
      qty: existingItem ? existingItem.qty : 1,
      price: p.price,
      product: p
    });
  });

  const productsByCategory = new Map();
  products.forEach(p => {
    const category = ProductCategorizer.getCategoryForProduct(p);
    if (!productsByCategory.has(category)) {
      productsByCategory.set(category, []);
    }
    productsByCategory.get(category).push(p);
  });

  const sortedCategories = [...productsByCategory.keys()].sort();
  
  function renderPickerList(filter = '') {
    container.innerHTML = '';
    const normFilter = filter.toLowerCase().trim();
    
    sortedCategories.forEach(category => {
      const filteredProducts = productsByCategory.get(category).filter(p => 
        p.name.toLowerCase().includes(normFilter)
      );

      if (filteredProducts.length === 0) return;

      const header = document.createElement('h5');
      header.className = 'picker-category-header';
      header.textContent = category;
      container.appendChild(header);

      filteredProducts.forEach(p => {
        const state = productStateMap.get(p.id);
        if (!state) {
          // Si por alguna razón no existe, inicializar
          const existingItem = existingMap.get(p.id);
          productStateMap.set(p.id, {
            checked: existingItem ? true : false,
            qty: existingItem ? existingItem.qty : 1,
            price: p.price,
            product: p
          });
        }
        
        const currentState = productStateMap.get(p.id);
        const row = document.createElement('div');
        row.className = 'picker-row';
        row.dataset.pid = p.id;
        row.innerHTML = `
          <div class="picker-left">
            <input type="checkbox" class="pick-check" data-id="${p.id}" ${currentState.checked ? 'checked' : ''} />
            <img src="${p.image || placeholderImage(p.name)}" />
            <div class="picker-info">
              <div class="picker-name">${escapeHtml(p.name)}</div>
              <div class="picker-details">${p.unit} · $${p.price.toFixed(2)} · ${p.category} ${p.code ? '· Código: ' + p.code : ''}</div>
              ${existingMap.has(p.id) ? '<div class="already-in-list">✅ Ya en lista</div>' : ''}
            </div>
          </div>
          <div class="picker-right">
            <div class="quantity-stepper">
              <button class="qty-btn" data-action="decrease" aria-label="Disminuir cantidad">-</button>
              <input class="pick-qty" type="number" min="0" max="99" value="${currentState.qty}" data-id="${p.id}" />
              <button class="qty-btn" data-action="increase" aria-label="Aumentar cantidad">+</button>
            </div>
            <div class="picker-price">$${p.price.toFixed(2)}</div>
          </div>
        `;
        container.appendChild(row);
      });
    });
  }
  
  renderPickerList();

  // --- MODIFICACIÓN: Confirmación para cancelar y guardar ---
  const savePickerChanges = () => {
    // Recopilar todos los productos seleccionados del ESTADO GLOBAL
    const selectedProducts = [];
    
    // Iterar sobre el mapa de estado para obtener TODOS los productos seleccionados
    for (const [pid, state] of productStateMap.entries()) {
      if (state.checked) {
        selectedProducts.push({
          pid: pid,
          qty: state.qty,
          price: state.price
        });
      }
    }

    if (selectedProducts.length === 0) {
      // Si no hay nada seleccionado, preguntar si quieren cerrar sin cambios
      if (confirm('No hay productos seleccionados. ¿Desea cerrar sin cambios?')) {
        modal.remove();
      }
      return;
    }

    const lists = loadLists();
    const idx = lists.findIndex(l => l.id === list.id);
    if (idx === -1) {
      modal.remove();
      return;
    }

    // Crear un mapa de los productos existentes en la lista
    const existingItemsMap = new Map();
    lists[idx].items.forEach(item => {
      existingItemsMap.set(item.productId, item);
    });

    // Procesar todos los productos seleccionados
    selectedProducts.forEach(({ pid, qty, price }) => {
      const prod = products.find(p => p.id === pid);
      if (!prod) return;
      
      const existingItem = existingItemsMap.get(pid);

      if (existingItem) {
        // Actualizar existente
        existingItem.qty = qty;
        existingItem.price = price;
      } else {
        // Añadir nuevo
        lists[idx].items.push({
          productId: pid,
          qty: qty,
          price: price,
          done: false
        });
      }
    });

    // Eliminar productos que fueron deseleccionados
    // Solo eliminar si estaban en la lista original y ahora están deseleccionados
    const selectedPids = new Set(selectedProducts.map(p => p.pid));
    lists[idx].items = lists[idx].items.filter(item => {
      // Mantener si está seleccionado O si no está en el mapa de estado (caso especial)
      const state = productStateMap.get(item.productId);
      if (!state) return true; // Conservar por seguridad
      return state.checked || !selectedPids.has(item.productId);
    });

    saveLists(lists);
    modal.remove();

    if (typeof onDone === 'function') onDone();
    pendingChanges = false;
    
    // Feedback visual
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--success);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      font-weight: bold;
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = `✅ ${selectedProducts.length} producto(s) guardado(s)`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  // Evento para cancelar (✖) con confirmación
  modal.querySelector('#picker-cancel').addEventListener('click', () => {
    showConfirm('¿Estás seguro que deseas salir y perder todos los cambios?', () => {
      modal.remove();
    });
  });

  // Evento para guardar (✔) con confirmación
  modal.querySelector('#picker-add').addEventListener('click', () => {
    showConfirm('¿Estás seguro que deseas guardar los cambios y salir?', savePickerChanges);
  });
  
  // --- CORRECCIÓN: El botón X solo limpia el texto, NO las selecciones ---
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderPickerList('');
  });
  
  searchInput.addEventListener('input', () => {
    renderPickerList(searchInput.value);
  });
  
  // --- Lógica de SpeechRecognition para el Picker ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let recognitionTimeout = null;

  if (!SpeechRecognition) {
    searchMicBtn.style.display = 'none';
  } else {
    searchMicBtn.addEventListener('click', startDictation);
  }
  
  function startDictation() {
    if (recognition && recognition.isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.isListening = true;
      recognition.onstart = () => {
        searchMicBtn.classList.add('listening');
        searchMicBtn.textContent = '...';
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        renderPickerList(transcript); // Actualizar filtro pero MANTENER estado
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Permiso de micrófono denegado. Revise la configuración de su navegador.');
        }
      };
      recognition.onend = () => {
        clearTimeout(recognitionTimeout);
        if (searchMicBtn) {
           searchMicBtn.classList.remove('listening');
           searchMicBtn.textContent = '🎤';
        }
        if (recognition) {
            recognition.isListening = false;
            recognition = null;
        }
      };
      recognition.start();
      recognitionTimeout = setTimeout(() => {
        if (recognition && recognition.isListening) {
          recognition.stop();
        }
      }, 6000);
    } catch (e) {
       console.error("Error al iniciar la API de reconocimiento:", e);
       if (e.name === 'NotAllowedError') {
           alert('Permiso de micrófono denegado. Revise la configuración de su navegador.');
       }
       if (searchMicBtn) {
           searchMicBtn.classList.remove('listening');
           searchMicBtn.textContent = '🎤';
       }
       if (recognition) {
           recognition.isListening = false;
           recognition = null;
       }
    }
  }

  // --- EVENTOS PARA ACTUALIZAR EL ESTADO GLOBAL ---
  container.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.matches('.qty-btn')) return;

    const row = target.closest('.picker-row');
    if (!row) return;

    const input = row.querySelector('.pick-qty');
    const pid = row.dataset.pid;
    if (!input) return;

    let qty = parseInt(input.value) || 0;
    if (target.dataset.action === 'increase') {
      qty++;
    } else if (target.dataset.action === 'decrease') {
      qty = Math.max(0, qty - 1);
    }
    
    input.value = qty;
    
    // Actualizar estado global
    const state = productStateMap.get(pid);
    if (state) {
      state.qty = qty;
      productStateMap.set(pid, state);
    }
  });

  container.addEventListener('input', (e) => {
    const target = e.target;
    if (!target.matches('.pick-qty')) return;
    const pid = target.dataset.id;
    const qty = parseInt(target.value) || 0;
    
    // Actualizar estado global
    const state = productStateMap.get(pid);
    if (state) {
      state.qty = qty;
      productStateMap.set(pid, state);
    }
  });

  // Evento para checkboxes - actualizar estado global
  container.addEventListener('change', (e) => {
    const target = e.target;
    if (!target.matches('.pick-check')) return;
    const pid = target.dataset.id;
    const isChecked = target.checked;
    
    // Actualizar estado global
    const state = productStateMap.get(pid);
    if (state) {
      state.checked = isChecked;
      productStateMap.set(pid, state);
    } else {
      // Si por alguna razón no existe, crear estado
      const prod = products.find(p => p.id === pid);
      if (prod) {
        productStateMap.set(pid, {
          checked: isChecked,
          qty: 1,
          price: prod.price,
          product: prod
        });
      }
    }
  });
}

/* ---------- Función de Exportación ---------- */
function generateProfessionalExportHTML(titulo, fecha, list, completados, pendientes, totalCompletado, totalPendiente) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      color: #2d3748;
      background: #f7fafc;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header .subtitle {
      margin: 8px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      padding: 25px;
      background: #f8fafc;
    }
    .info-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #667eea;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .info-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-card p {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      color: #2d3748;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 0 25px 25px;
    }
    .summary-card {
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    .summary-card.completed {
      background: linear-gradient(135deg, #48bb78, #38a169);
      color: white;
    }
    .summary-card.pending {
      background: linear-gradient(135deg, #ed8936, #dd6b20);
      color: white;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .summary-card .count {
      font-size: 32px;
      font-weight: bold;
      margin: 0 0 5px 0;
    }
    .summary-card .amount {
      font-size: 18px;
      opacity: 0.9;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    th {
      background: #2d3748;
      color: white;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .completado-row {
      background: #f0fff4;
    }
    .pendiente-row {
      background: #fff5f5;
    }
    .estado {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      text-align: center;
      display: inline-block;
    }
    .estado-completado {
      background: #48bb78;
      color: white;
    }
    .estado-pendiente {
      background: #ed8936;
      color: white;
    }
    .right {
      text-align: right;
    }
    .center {
      text-align: center;
    }
    .total-section {
      background: #edf2f7;
      padding: 25px;
      margin: 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 12px 0;
      font-size: 16px;
    }
    .total-final {
      font-size: 22px;
      font-weight: bold;
      color: #2d3748;
      border-top: 2px solid #cbd5e0;
      padding-top: 15px;
      margin-top: 15px;
    }
    .total-final .amount {
      color: #667eea;
      font-size: 24px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #718096;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${titulo}</h1>
      <div class="subtitle">Reporte detallado de compras</div>
    </div>
    
    <div class="info-grid">
      <div class="info-card">
        <h3>📅 Fecha de generación</h3>
        <p>${fecha}</p>
      </div>
      <div class="info-card">
        <h3>📦 Total de productos</h3>
        <p>${list.items.length}</p>
      </div>
      <div class="info-card">
        <h3>⏰ Hora de exportación</h3>
        <p>${new Date().toLocaleTimeString('es-ES')}</p>
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card completed">
        <h3>✅ PRODUCTOS COMPRADOS</h3>
        <div class="count">${completados.length}</div>
        <div class="amount">$${totalCompletado.toFixed(2)}</div>
      </div>
      <div class="summary-card pending">
        <h3>⏳ PRODUCTOS PENDIENTES</h3>
        <div class="count">${pendientes.length}</div>
        <div class="amount">$${totalPendiente.toFixed(2)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Unidad</th>
          <th class="right">Precio Unit.</th>
          <th class="center">Cantidad</th>
          <th class="right">Subtotal</th>
          <th class="center">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${completados.map(item => `
          <tr class="completado-row">
            <td>${escapeHtml(item.producto)}</td>
            <td>${escapeHtml(item.unidad)}</td>
            <td class="right">$${item.precio.toFixed(2)}</td>
            <td class="center">${item.cantidad}</td>
            <td class="right">$${item.subtotal.toFixed(2)}</td>
            <td class="center"><span class="estado estado-completado">COMPRADO</span></td>
          </tr>
        `).join('')}
        ${pendientes.map(item => `
          <tr class="pendiente-row">
            <td>${escapeHtml(item.producto)}</td>
            <td>${escapeHtml(item.unidad)}</td>
            <td class="right">$${item.precio.toFixed(2)}</td>
            <td class="center">${item.cantidad}</td>
            <td class="right">$${item.subtotal.toFixed(2)}</td>
            <td class="center"><span class="estado estado-pendiente">PENDIENTE</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <span>Total COMPRADO:</span>
        <span class="right">$${totalCompletado.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Total PENDIENTE:</span>
        <span class="right">$${totalPendiente.toFixed(2)}</span>
      </div>
      <div class="total-row total-final">
        <span>TOTAL GENERAL:</span>
        <span class="right amount">$${(totalCompletado + totalPendiente).toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      Generado por Supermercado Pro • ${new Date().getFullYear()} • 
      <em>Documento profesional para control de compras</em>
    </div>
  </div>
</body>
</html>`;
}

/* ---------- Calculadora ---------- */
function initCalculator() {
  const calculatorModal = document.getElementById('calculator-modal');
  const calculatorPopup = calculatorModal.querySelector('.calculator-popup');
  const popupCalculator = new Calculator(calculatorPopup, true);

  document.getElementById('btn-calculator-popup').addEventListener('click', function () {
    calculatorModal.classList.remove('hidden');
  });

  document.getElementById('close-calculator').addEventListener('click', function () {
    calculatorModal.classList.add('hidden');
  });
}

class Calculator {
  constructor(container, isPopup = false) {
    this.container = container;
    this.isPopup = isPopup;
    this.currentInput = '0';
    this.operation = '';
    this.previousInput = '';
    this.operator = null;
    this.waitingForNewInput = false;
    this.savedResults = [];

    this.init();
  }

  init() {
    this.createKeypad();
    this.updateDisplay();
    this.setupEventListeners();
    this.updateSavedResults();
  }

  createKeypad() {
    const keypad = this.container.querySelector('.calculator-keypad');

    const buttons = [
      { text: 'C', class: 'function', action: 'clear' },
      { text: '←', class: 'function', action: 'backspace' },
      { text: '%', class: 'function', action: 'percentage' },
      { text: '/', class: 'operator', action: 'divide' },
      { text: '7', class: '', action: '7' },
      { text: '8', class: '', action: '8' },
      { text: '9', class: '', action: '9' },
      { text: '*', class: 'operator', action: 'multiply' },
      { text: '4', class: '', action: '4' },
      { text: '5', class: '', action: '5' },
      { text: '6', class: '', action: '6' },
      { text: '-', class: 'operator', action: 'subtract' },
      { text: '1', class: '', action: '1' },
      { text: '2', class: '', action: '2' },
      { text: '3', class: '', action: '3' },
      { text: '+', class: 'operator', action: 'add' },
      { text: '0', class: '', action: '0', colSpan: 2 },
      { text: '.', class: '', action: 'decimal' },
      { text: '=', class: 'equals', action: 'equals' }
    ];

    keypad.innerHTML = '';

    buttons.forEach(button => {
      const btn = document.createElement('button');
      btn.textContent = button.text;
      btn.classList.add('calc-btn');
      if (button.class) btn.classList.add(button.class);
      if (button.colSpan) btn.style.gridColumn = `span ${button.colSpan}`;

      btn.dataset.action = button.action;
      keypad.appendChild(btn);
    });
  }

  setupEventListeners() {
    this.container.querySelector('.calculator-keypad').addEventListener('click', (e) => {
      if (e.target.matches('.calc-btn')) {
        this.handleButtonClick(e.target.dataset.action);
      }
    });

    const sizeButtons = this.container.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.changeSize(btn.dataset.size);
      });
    });

    if (this.isPopup) {
      this.container.querySelector('.btn-save').addEventListener('click', () => {
        this.saveResult();
      });

      this.container.querySelector('.btn-remove-last').addEventListener('click', () => {
        this.removeLastSaved();
      });
    }
  }

  handleButtonClick(action) {
    switch (action) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        this.inputNumber(action);
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'add': case 'subtract': case 'multiply': case 'divide':
        this.inputOperator(action);
        break;
      case 'equals':
        this.calculate();
        break;
      case 'clear':
        this.clear();
        break;
      case 'backspace':
        this.backspace();
        break;
      case 'percentage':
        this.inputPercentage();
        break;
    }

    this.updateDisplay();
  }

  inputNumber(num) {
    if (this.waitingForNewInput) {
      this.currentInput = num;
      this.waitingForNewInput = false;
    } else {
      this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
    }
  }

  inputDecimal() {
    if (this.waitingForNewInput) {
      this.currentInput = '0.';
      this.waitingForNewInput = false;
      return;
    }

    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }
  }

  inputPercentage() {
    const current = parseFloat(this.currentInput);
    if (!isNaN(current)) {
      this.currentInput = String(current / 100);
      this.waitingForNewInput = true;
    }
  }

  inputOperator(nextOperator) {
    const inputValue = parseFloat(this.currentInput);

    if (this.operator && this.waitingForNewInput) {
      this.operator = nextOperator;
      return;
    }

    if (this.previousInput === '') {
      this.previousInput = inputValue;
    } else if (this.operator) {
      const currentValue = this.previousInput || 0;
      const newValue = this.calculateIntermediate(currentValue, inputValue, this.operator);

      this.currentInput = String(newValue);
      this.previousInput = newValue;
    }

    this.waitingForNewInput = true;
    this.operator = nextOperator;
    this.operation = `${this.previousInput} ${this.getOperatorSymbol(this.operator)}`;
  }

  calculate() {
    const inputValue = parseFloat(this.currentInput);

    if (this.operator) {
      const currentValue = this.previousInput || 0;
      const newValue = this.calculateIntermediate(currentValue, inputValue, this.operator);

      this.currentInput = String(newValue);
      this.operation = `${currentValue} ${this.getOperatorSymbol(this.operator)} ${inputValue} =`;
      this.previousInput = '';
      this.operator = null;
      this.waitingForNewInput = true;
    }
  }

  calculateIntermediate(firstValue, secondValue, operator) {
    switch (operator) {
      case 'add': return firstValue + secondValue;
      case 'subtract': return firstValue - secondValue;
      case 'multiply': return firstValue * secondValue;
      case 'divide': return secondValue !== 0 ? firstValue / secondValue : 0;
      default: return secondValue;
    }
  }

  getOperatorSymbol(operator) {
    switch (operator) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '';
    }
  }

  clear() {
    this.currentInput = '0';
    this.operation = '';
    this.previousInput = '';
    this.operator = null;
    this.waitingForNewInput = false;
  }

  backspace() {
    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      this.currentInput = '0';
    }
  }

  updateDisplay() {
    const operationDisplay = this.container.querySelector('.operation-display');
    const resultDisplay = this.container.querySelector('.result-display');

    operationDisplay.textContent = this.operation;
    resultDisplay.textContent = this.currentInput;
  }

  saveResult() {
    if (this.operator && this.previousInput !== '' && !this.waitingForNewInput) {
      this.calculate();
      this.updateDisplay();
    }

    const result = parseFloat(this.currentInput);
    if (!isNaN(result)) {
      let operationText = this.operation;
      this.savedResults.push({
        operation: operationText,
        result: result,
        display: `${operationText} ${result}`
      });
      this.updateSavedResults();
      this.clear();
      this.updateDisplay();
    }
  }

  removeLastSaved() {
    if (this.savedResults.length > 0) {
      this.savedResults.pop();
      this.updateSavedResults();
    }
  }

  removeSavedResult(index) {
    if (index >= 0 && index < this.savedResults.length) {
      this.savedResults.splice(index, 1);
      this.updateSavedResults();
    }
  }

  updateSavedResults() {
    const savedValuesContainer = this.container.querySelector('.saved-values');
    savedValuesContainer.innerHTML = '';

    if (this.savedResults.length === 0) {
      savedValuesContainer.innerHTML = '<div style="color:#666;text-align:center;padding:10px;">No hay resultados guardados</div>';
      return;
    }

    // Ordenar resultados por valor (de menor a mayor)
    const sortedResults = [...this.savedResults].sort((a, b) => a.result - b.result);
    
    // Identificar los 3 valores más bajos
    const lowestValues = [];
    if (sortedResults.length >= 1) lowestValues.push(sortedResults[0].result);
    if (sortedResults.length >= 2) lowestValues.push(sortedResults[1].result);
    if (sortedResults.length >= 3) lowestValues.push(sortedResults[2].result);

    this.savedResults.forEach((item, index) => {
      const valueElement = document.createElement('div');
      valueElement.classList.add('saved-value');

      // Determinar la clase según el valor
      if (item.result === lowestValues[0]) {
        valueElement.classList.add('lowest');
      } else if (item.result === lowestValues[1]) {
        valueElement.classList.add('second-lowest');
      } else if (item.result === lowestValues[2]) {
        valueElement.classList.add('third-lowest');
      } else {
        valueElement.classList.add('other');
      }

      // Crear contenedor interno con el texto y botón de eliminar
      valueElement.innerHTML = `
        <span class="saved-value-text">${item.display}</span>
        <button class="saved-value-delete" data-index="${index}" aria-label="Eliminar resultado">×</button>
      `;

      valueElement.title = `Clic para usar: ${item.result}`;

      // Evento para usar el valor
      valueElement.addEventListener('click', (e) => {
        if (!e.target.classList.contains('saved-value-delete')) {
          this.currentInput = String(item.result);
          this.operation = '';
          this.updateDisplay();
        }
      });

      // Evento para eliminar el resultado
      const deleteBtn = valueElement.querySelector('.saved-value-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeSavedResult(index);
      });

      savedValuesContainer.appendChild(valueElement);
    });
  }

  changeSize(size) {
    this.container.classList.remove('small', 'medium', 'large');
    this.container.classList.add(size);

    const sizeButtons = this.container.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === size);
    });
  }
}

/* ---------- Utilidades ---------- */
function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'backup.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 100);
}

function placeholderImage(text) {
  const initials = (text || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() || 'P';
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 160;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#eef2f6';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#2b6cb0';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, c.width / 2, c.height / 2);
  return c.toDataURL();
}

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = e => rej(e);
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function escapeCsv(v) {
  if (v == null) return '';
  if (String(v).includes(',') || String(v).includes('"') || String(v).includes('\n'))
    return `"${String(v).replace(/"/g, '""')}"`;
  return v;
}

/* ============================================================
   v8.0 - Zona de Juegos, fallback de imágenes y verificación
   ============================================================ */
function renderGamesView(container) {
    const tpl = document.getElementById('template-games').content.cloneNode(true);
    container.appendChild(tpl);
    const hub = container.querySelector('#games-hub');
    const stage = container.querySelector('#games-stage');
    const backBtn = container.querySelector('#btn-games-back');
    if (typeof GamesHub !== 'undefined' && GamesHub.init) {
        GamesHub.init(hub, stage, backBtn);
    } else {
        hub.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">⚠️ No se pudo cargar el módulo de juegos. Verifique que <b>games.js</b> esté en la misma carpeta.</div>';
    }
}

/* Fallback global: cualquier <img> que falle muestra un placeholder con iniciales */
function setupGlobalImageFallback() {
    document.addEventListener('error', (e) => {
        const t = e.target;
        if (!t || t.tagName !== 'IMG') return;
        if (t.dataset.fallbackApplied) return;
        t.dataset.fallbackApplied = '1';
        const name = t.alt || t.getAttribute('data-name') || 'P';
        try { t.src = placeholderImage(name); } catch (err) { t.style.display = 'none'; }
    }, true);
}

/* Verifica cada producto: prueba cargar su imagen y reporta faltantes */
function verifyProductImages() {
    const products = loadProducts();
    if (products.length === 0) { alert('❌ No hay productos cargados.'); return; }
    showImageReport('<div class="img-report-summary">Verificando ' + products.length + ' productos… <span id="verify-progress">0</span>/' + products.length + '</div><div id="verify-list"></div>');
    const listEl = document.getElementById('verify-list');
    const progEl = document.getElementById('verify-progress');
    let idx = 0, missing = 0, ok = 0, checked = 0;
    const total = products.length;
    function testNext() {
        if (idx >= total) {
            const s = document.querySelector('.img-report-summary');
            if (s) s.innerHTML = '✅ Verificación completada.<br>🟢 Encontradas: <b>' + ok + '</b> &nbsp;&nbsp; 🔴 Faltantes / rotas: <b>' + missing + '</b>' +
                (missing > 0 ? '<br><br><small style="font-weight:normal">Las faltantes muestran un placeholder con iniciales. Asegúrese de que el archivo exista en <b>assets/</b> con el nombre exacto del producto.</small>' : '');
            return;
        }
        const batch = products.slice(idx, idx + 6);
        idx += 6;
        let pending = batch.length;
        batch.forEach(p => {
            const tried = (p.image && p.image.trim()) ? p.image : ('assets/' + p.name + '.png');
            const img = new Image();
            let done = false;
            const finish = (isOk) => {
                if (done) return; done = true;
                checked++;
                if (progEl) progEl.textContent = checked;
                if (isOk) { ok++; }
                else {
                    missing++;
                    const div = document.createElement('div');
                    div.className = 'img-report-item missing';
                    div.innerHTML = '🔴 <b>' + escapeHtml(p.name) + '</b><br><small>Ruta: <code>' + escapeHtml(tried) + '</code></small>';
                    if (listEl) listEl.appendChild(div);
                }
                if (--pending === 0) testNext();
            };
            img.onload = () => finish(true);
            img.onerror = () => finish(false);
            img.src = tried + (tried.indexOf('?') !== -1 ? '&' : '?') + '_t=' + Date.now();
        });
    }
    testNext();
}

function setupImageReportModal() {
    const modal = document.getElementById('image-report-modal');
    if (!modal) return;
    document.getElementById('close-image-report').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
}
function showImageReport(html) {
    const modal = document.getElementById('image-report-modal');
    document.getElementById('image-report-body').innerHTML = html;
    modal.classList.remove('hidden');
}

function highlightNav() {
    const hash = location.hash || '#products';
    $$('.main-menu button[data-route]').forEach(b => {
        b.classList.toggle('active-nav', b.dataset.route === hash);
    });
}
