/**
 * Expanded plant catalog seeder.
 * Fetches images + descriptions from Wikipedia for each plant.
 * Run with: npm run db:seed-plants
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Category = 'tropical' | 'flowering' | 'palms' | 'succulents' | 'edible' | 'native'
type CareLevel = 'easy' | 'moderate' | 'expert'
type Sunlight  = 'full' | 'partial' | 'shade'
type Water     = 'low' | 'moderate' | 'high'

interface PlantSeed {
  nameEn:   string
  nameEs:   string
  wiki:     string   // English Wikipedia article title
  wikiEs?:  string   // Spanish Wikipedia title (defaults to nameEs)
  category: Category
  price:    number
  care:     CareLevel
  sun:      Sunlight
  water:    Water
  tags:     string
  featured?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Plant data — ~90 species relevant to South Florida / Miami gardening
// ─────────────────────────────────────────────────────────────────────────────
const PLANTS: PlantSeed[] = [
  // ── Palms ─────────────────────────────────────────────────────────────────
  { nameEn: 'Areca Palm',        nameEs: 'Palma Areca',            wiki: 'Dypsis lutescens',          wikiEs: 'Dypsis lutescens',          category: 'palms',      price: 89,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'privacy,pool,tropical,fast-growing',         featured: true  },
  { nameEn: 'Bismarck Palm',     nameEs: 'Palma Bismarck',         wiki: 'Bismarckia nobilis',        wikiEs: 'Bismarckia nobilis',         category: 'palms',      price: 199, care: 'easy',     sun: 'full',    water: 'low',      tags: 'statement,silver,large'                                        },
  { nameEn: 'Christmas Palm',    nameEs: 'Palma Navideña',         wiki: 'Adonidia merrillii',        wikiEs: 'Adonidia merrillii',         category: 'palms',      price: 120, care: 'easy',     sun: 'full',    water: 'moderate', tags: 'elegant,compact,landscape'                                      },
  { nameEn: 'Coconut Palm',      nameEs: 'Palma de Coco',          wiki: 'Cocos nucifera',            wikiEs: 'Cocos nucifera',             category: 'palms',      price: 149, care: 'easy',     sun: 'full',    water: 'moderate', tags: 'tropical,beach,iconic,edible',               featured: true  },
  { nameEn: 'Fishtail Palm',     nameEs: 'Palma Cola de Pez',      wiki: 'Caryota mitis',             wikiEs: 'Caryota mitis',              category: 'palms',      price: 129, care: 'moderate', sun: 'partial', water: 'moderate', tags: 'unique,tropical,cluster'                                        },
  { nameEn: 'Foxtail Palm',      nameEs: 'Palma Cola de Zorro',    wiki: 'Wodyetia bifurcata',        wikiEs: 'Wodyetia bifurcata',         category: 'palms',      price: 149, care: 'easy',     sun: 'full',    water: 'moderate', tags: 'elegant,fast-growing,landscape'                                 },
  { nameEn: 'Mexican Fan Palm',  nameEs: 'Palma Abanico Mexicana', wiki: 'Washingtonia robusta',      wikiEs: 'Washingtonia robusta',       category: 'palms',      price: 75,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'tall,drought-tolerant,urban'                                    },
  { nameEn: 'Queen Palm',        nameEs: 'Palma Reina',            wiki: 'Syagrus romanzoffiana',     wikiEs: 'Syagrus romanzoffiana',      category: 'palms',      price: 129, care: 'easy',     sun: 'full',    water: 'moderate', tags: 'graceful,feathery,pool'                                         },
  { nameEn: 'Royal Palm',        nameEs: 'Palma Real',             wiki: 'Roystonea regia',           wikiEs: 'Roystonea regia',            category: 'palms',      price: 175, care: 'easy',     sun: 'full',    water: 'moderate', tags: 'majestic,formal,iconic',                     featured: true  },
  { nameEn: 'Sabal Palm',        nameEs: 'Palma Sabal',            wiki: 'Sabal palmetto',            wikiEs: 'Sabal palmetto',             category: 'palms',      price: 89,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'native,drought-tolerant,florida'                                },
  { nameEn: 'Sago Palm',         nameEs: 'Palma Sagú',             wiki: 'Cycas revoluta',            wikiEs: 'Cycas revoluta',             category: 'palms',      price: 95,  care: 'moderate', sun: 'full',    water: 'low',      tags: 'ancient,sculptural,slow-growing'                                },
  { nameEn: "Traveler's Palm",   nameEs: 'Palma del Viajero',      wiki: 'Ravenala madagascariensis', wikiEs: 'Ravenala madagascariensis',  category: 'palms',      price: 145, care: 'easy',     sun: 'full',    water: 'moderate', tags: 'statement,tropical,architectural',           featured: true  },
  { nameEn: 'Washingtonia Palm', nameEs: 'Palma Washingtonia',     wiki: 'Washingtonia (plant)',      wikiEs: 'Washingtonia (planta)',      category: 'palms',      price: 85,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'tall,drought-tolerant'                                          },
  { nameEn: 'Windmill Palm',     nameEs: 'Palma Molino de Viento', wiki: 'Trachycarpus fortunei',     wikiEs: 'Trachycarpus fortunei',      category: 'palms',      price: 99,  care: 'moderate', sun: 'partial', water: 'moderate', tags: 'cold-hardy,compact'                                             },

  // ── Flowering ─────────────────────────────────────────────────────────────
  { nameEn: 'African Iris',        nameEs: 'Iris Africano',        wiki: 'Dietes iridioides',            wikiEs: 'Dietes iridioides',         category: 'flowering', price: 22,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'border,drought-tolerant,white'                                  },
  { nameEn: 'Bauhinia',            nameEs: 'Árbol de Orquídea',    wiki: 'Bauhinia purpurea',            wikiEs: 'Bauhinia purpurea',         category: 'flowering', price: 65,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'tree,orchid-like,pink,butterfly'                                 },
  { nameEn: 'Blue Daze',           nameEs: 'Rocío Azul',           wiki: 'Evolvulus glomeratus',         wikiEs: 'Evolvulus glomeratus',      category: 'flowering', price: 15,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'groundcover,blue,border'                                        },
  { nameEn: 'Bougainvillea',       nameEs: 'Buganvilla',           wiki: 'Bougainvillea',                wikiEs: 'Bougainvillea',             category: 'flowering', price: 35,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'climber,fence,colorful,drought-tolerant',    featured: true  },
  { nameEn: 'Canna Lily',          nameEs: 'Lirio Canna',          wiki: 'Canna (plant)',                wikiEs: 'Canna (planta)',            category: 'flowering', price: 25,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'bold,tropical,colorful'                                         },
  { nameEn: 'Confederate Jasmine', nameEs: 'Jazmín Confederado',   wiki: 'Trachelospermum jasminoides',  wikiEs: 'Trachelospermum jasminoides',category:'flowering', price: 28,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'fragrant,climber,fence,white'                                   },
  { nameEn: 'Coral Honeysuckle',   nameEs: 'Madreselva Coral',     wiki: 'Lonicera sempervirens',        wikiEs: 'Lonicera sempervirens',     category: 'flowering', price: 22,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'native,hummingbird,climber,red'                                 },
  { nameEn: 'Dwarf Bougainvillea', nameEs: 'Buganvilla Enana',     wiki: 'Bougainvillea',                wikiEs: 'Bougainvillea',             category: 'flowering', price: 28,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'compact,colorful,border,container'                              },
  { nameEn: 'Dwarf Ixora',         nameEs: 'Ixora Enana',          wiki: 'Ixora coccinea',               wikiEs: 'Ixora coccinea',            category: 'flowering', price: 22,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'compact,border,hedge,red'                                       },
  { nameEn: 'Gardenia',            nameEs: 'Gardenia',             wiki: 'Gardenia jasminoides',         wikiEs: 'Gardenia jasminoides',      category: 'flowering', price: 38,  care: 'moderate', sun: 'partial', water: 'moderate', tags: 'fragrant,white,classic'                                         },
  { nameEn: 'Hibiscus',            nameEs: 'Hibisco',              wiki: 'Hibiscus rosa-sinensis',       wikiEs: 'Hibiscus rosa-sinensis',    category: 'flowering', price: 28,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'tropical,colorful,hummingbird',              featured: true  },
  { nameEn: 'Ixora',               nameEs: 'Ixora',                wiki: 'Ixora coccinea',               wikiEs: 'Ixora coccinea',            category: 'flowering', price: 22,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'hedge,colorful,butterfly,year-round',        featured: true  },
  { nameEn: 'Jasmine',             nameEs: 'Jazmín',               wiki: 'Jasminum sambac',              wikiEs: 'Jasminum sambac',           category: 'flowering', price: 28,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'fragrant,classic,white'                                         },
  { nameEn: 'Lantana',             nameEs: 'Lantana',              wiki: 'Lantana camara',               wikiEs: 'Lantana camara',            category: 'flowering', price: 16,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'butterfly,border,colorful,fast-growing'                         },
  { nameEn: 'Pentas',              nameEs: 'Pentas',               wiki: 'Pentas lanceolata',            wikiEs: 'Pentas lanceolata',         category: 'flowering', price: 15,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'butterfly,hummingbird,colorful,year-round'                      },
  { nameEn: 'Plumbago',            nameEs: 'Plumbago',             wiki: 'Plumbago auriculata',          wikiEs: 'Plumbago auriculata',       category: 'flowering', price: 20,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'hedge,blue,butterfly,year-round',            featured: true  },
  { nameEn: 'Portulaca',           nameEs: 'Portulaca',            wiki: 'Portulaca grandiflora',        wikiEs: 'Portulaca grandiflora',     category: 'flowering', price: 12,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'groundcover,colorful,drought-tolerant'                          },
  { nameEn: 'Royal Poinciana',     nameEs: 'Framboyán',            wiki: 'Delonix regia',                wikiEs: 'Delonix regia',             category: 'flowering', price: 125, care: 'easy',     sun: 'full',    water: 'low',      tags: 'tree,dramatic,red,iconic',                  featured: true  },
  { nameEn: 'Salvia',              nameEs: 'Salvia',               wiki: 'Salvia splendens',             wikiEs: 'Salvia splendens',          category: 'flowering', price: 15,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'hummingbird,butterfly,herb'                                     },
  { nameEn: 'Star Jasmine',        nameEs: 'Jazmín de Estrella',   wiki: 'Trachelospermum jasminoides',  wikiEs: 'Trachelospermum jasminoides',category:'flowering', price: 28,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'fragrant,climber,fence,pergola'                                  },
  { nameEn: 'Thryallis',           nameEs: 'Triyalis',             wiki: 'Galphimia gracilis',           wikiEs: 'Galphimia gracilis',        category: 'flowering', price: 25,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'yellow,butterfly,border,drought-tolerant'                       },
  { nameEn: 'Yellow Elder',        nameEs: 'Tronador Amarillo',    wiki: 'Tecoma stans',                 wikiEs: 'Tecoma stans',              category: 'flowering', price: 45,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'tree,yellow,butterfly,native-like'                              },

  // ── Tropical / Foliage ────────────────────────────────────────────────────
  { nameEn: 'African Tulip Tree',  nameEs: 'Árbol Tulipán Africano', wiki: 'Spathodea campanulata',    wikiEs: 'Spathodea campanulata',     category: 'tropical',  price: 85,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'tree,dramatic,orange'                                           },
  { nameEn: 'Air Plant',           nameEs: 'Planta de Aire',         wiki: 'Tillandsia',               wikiEs: 'Tillandsia',               category: 'tropical',  price: 18,  care: 'easy',     sun: 'partial', water: 'low',      tags: 'epiphyte,no-soil,unique,display'                                },
  { nameEn: 'Alpinia',             nameEs: 'Alpinia',                wiki: 'Alpinia zerumbet',         wikiEs: 'Alpinia zerumbet',         category: 'tropical',  price: 35,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'ginger-family,tropical,fragrant'                                },
  { nameEn: 'Anthurium',           nameEs: 'Anturio',                wiki: 'Anthurium',                wikiEs: 'Anthurium',                category: 'tropical',  price: 45,  care: 'moderate', sun: 'shade',   water: 'moderate', tags: 'tropical,indoor,flowering,red'                                  },
  { nameEn: 'Banana Tree',         nameEs: 'Platanero',              wiki: 'Musa (plant)',             wikiEs: 'Musa (planta)',            category: 'tropical',  price: 55,  care: 'easy',     sun: 'full',    water: 'high',     tags: 'tropical,fast-growing,edible,dramatic',      featured: true  },
  { nameEn: 'Bird of Paradise',    nameEs: 'Ave del Paraíso',        wiki: 'Strelitzia reginae',       wikiEs: 'Strelitzia reginae',       category: 'tropical',  price: 65,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'architectural,focal-point,tropical',         featured: true  },
  { nameEn: 'Bromeliad',           nameEs: 'Bromelia',               wiki: 'Bromeliaceae',             wikiEs: 'Bromeliaceae',             category: 'tropical',  price: 25,  care: 'easy',     sun: 'partial', water: 'low',      tags: 'tropical,colorful,epiphyte,display'                             },
  { nameEn: 'Caladium',            nameEs: 'Caladio',                wiki: 'Caladium',                 wikiEs: 'Caladium',                 category: 'tropical',  price: 28,  care: 'moderate', sun: 'shade',   water: 'moderate', tags: 'colorful,shade,foliage,seasonal'                                },
  { nameEn: 'Calathea',            nameEs: 'Calatea',                wiki: 'Goeppertia',               wikiEs: 'Calathea',                 category: 'tropical',  price: 38,  care: 'moderate', sun: 'shade',   water: 'high',     tags: 'patterned,indoor,tropical,bold'                                 },
  { nameEn: 'Clusia',              nameEs: 'Clusia',                 wiki: 'Clusia rosea',             wikiEs: 'Clusia rosea',             category: 'tropical',  price: 45,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'hedge,salt-tolerant,coastal,thick'                              },
  { nameEn: 'Costus',              nameEs: 'Costus',                 wiki: 'Costus spicatus',          wikiEs: 'Costus spicatus',          category: 'tropical',  price: 32,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'ginger-relative,tropical,flowering'                             },
  { nameEn: 'Croton',              nameEs: 'Croton',                 wiki: 'Codiaeum variegatum',      wikiEs: 'Codiaeum variegatum',      category: 'tropical',  price: 28,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'colorful,tropical,bold,container',           featured: true  },
  { nameEn: 'Dieffenbachia',       nameEs: 'Diefenbaquia',           wiki: 'Dieffenbachia',            wikiEs: 'Dieffenbachia',            category: 'tropical',  price: 35,  care: 'moderate', sun: 'shade',   water: 'moderate', tags: 'indoor,tropical,large-leaf'                                     },
  { nameEn: 'Dracaena',            nameEs: 'Drácena',                wiki: 'Dracaena marginata',       wikiEs: 'Dracaena marginata',       category: 'tropical',  price: 45,  care: 'easy',     sun: 'partial', water: 'low',      tags: 'indoor,drought-tolerant,architectural'                          },
  { nameEn: 'Dwarf Olive Tree',    nameEs: 'Olivo Enano',            wiki: 'Olea europaea',            wikiEs: 'Olea europaea',            category: 'tropical',  price: 95,  care: 'moderate', sun: 'full',    water: 'low',      tags: 'container,mediterranean,patio,elegant',      featured: true  },
  { nameEn: 'Fiddle Leaf Fig',     nameEs: 'Ficus Lyrata',           wiki: 'Ficus lyrata',             wikiEs: 'Ficus lyrata',             category: 'tropical',  price: 85,  care: 'moderate', sun: 'partial', water: 'moderate', tags: 'indoor,statement,designer,large-leaf'                           },
  { nameEn: 'Frangipani',          nameEs: 'Plumeria',               wiki: 'Plumeria',                 wikiEs: 'Plumeria',                 category: 'tropical',  price: 55,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'fragrant,tropical,lei,island'                                   },
  { nameEn: 'Ginger',              nameEs: 'Jengibre Ornamental',    wiki: 'Hedychium',                wikiEs: 'Hedychium',                category: 'tropical',  price: 32,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'fragrant,tropical,edible,large'                                 },
  { nameEn: 'Heliconia',           nameEs: 'Heliconia',              wiki: 'Heliconia',                wikiEs: 'Heliconia',                category: 'tropical',  price: 45,  care: 'easy',     sun: 'full',    water: 'high',     tags: 'tropical,dramatic,bird-attracting,bold'                         },
  { nameEn: 'Jatropha',            nameEs: 'Jatrofa',                wiki: 'Jatropha integerrima',     wikiEs: 'Jatropha integerrima',     category: 'tropical',  price: 38,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'butterfly,red,drought-tolerant'                                 },
  { nameEn: 'Liriope',             nameEs: 'Liriope',                wiki: 'Liriope muscari',          wikiEs: 'Liriope muscari',          category: 'tropical',  price: 22,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'groundcover,border,shade-tolerant,purple'                       },
  { nameEn: 'Monstera Deliciosa',  nameEs: 'Monstruo Delicioso',     wiki: 'Monstera deliciosa',       wikiEs: 'Monstera deliciosa',       category: 'tropical',  price: 65,  care: 'moderate', sun: 'partial', water: 'moderate', tags: 'trendy,indoor,large-leaf,bold',              featured: true  },
  { nameEn: 'Mussaenda',           nameEs: 'Mussaenda',              wiki: 'Mussaenda',                wikiEs: 'Mussaenda',                category: 'tropical',  price: 45,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'colorful,tropical,showy'                                        },
  { nameEn: 'Orchid',              nameEs: 'Orquídea',               wiki: 'Orchidaceae',              wikiEs: 'Orchidaceae',              category: 'tropical',  price: 55,  care: 'expert',   sun: 'partial', water: 'moderate', tags: 'elegant,exotic,indoor,flowering'                                },
  { nameEn: 'Peace Lily',          nameEs: 'Lirio de la Paz',        wiki: 'Spathiphyllum',            wikiEs: 'Spathiphyllum',            category: 'tropical',  price: 38,  care: 'easy',     sun: 'shade',   water: 'moderate', tags: 'indoor,air-purifying,white,shade'                               },
  { nameEn: 'Philodendron',        nameEs: 'Filodendro',             wiki: 'Philodendron',             wikiEs: 'Philodendron',             category: 'tropical',  price: 45,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'indoor,tropical,easy-care,climbing'                             },
  { nameEn: 'Podocarpus',          nameEs: 'Podocarpus',             wiki: 'Podocarpus macrophyllus',  wikiEs: 'Podocarpus macrophyllus',  category: 'tropical',  price: 45,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'hedge,formal,privacy,slow-growing'                              },
  { nameEn: 'Pothos',              nameEs: 'Potus',                  wiki: 'Epipremnum aureum',        wikiEs: 'Epipremnum aureum',        category: 'tropical',  price: 22,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'indoor,trailing,easy-care,air-purifying'                        },
  { nameEn: 'Rubber Plant',        nameEs: 'Árbol del Caucho',       wiki: 'Ficus elastica',           wikiEs: 'Ficus elastica',           category: 'tropical',  price: 55,  care: 'moderate', sun: 'partial', water: 'moderate', tags: 'indoor,bold,glossy,large-leaf'                                  },
  { nameEn: 'Schefflera',          nameEs: 'Schefflera',             wiki: 'Schefflera',               wikiEs: 'Schefflera',               category: 'tropical',  price: 45,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'umbrella-tree,indoor,tropical'                                  },
  { nameEn: 'Snake Plant',         nameEs: 'Planta Serpiente',       wiki: 'Dracaena trifasciata',     wikiEs: 'Dracaena trifasciata',     category: 'tropical',  price: 38,  care: 'easy',     sun: 'partial', water: 'low',      tags: 'indoor,architectural,air-purifying,drought-tolerant', featured: true },
  { nameEn: 'Strelitzia',          nameEs: 'Ave del Paraíso Blanca', wiki: 'Strelitzia nicolai',       wikiEs: 'Strelitzia nicolai',       category: 'tropical',  price: 85,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'statement,tropical,architectural,large'                         },
  { nameEn: 'Sweet Potato Vine',   nameEs: 'Batata Ornamental',      wiki: 'Ipomoea batatas',          wikiEs: 'Ipomoea batatas',          category: 'tropical',  price: 15,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'groundcover,colorful,fast-growing,container'                    },
  { nameEn: 'Variegated Ginger',   nameEs: 'Jengibre Variegado',     wiki: 'Alpinia zerumbet',         wikiEs: 'Alpinia zerumbet',         category: 'tropical',  price: 38,  care: 'easy',     sun: 'partial', water: 'moderate', tags: 'variegated,tropical,ginger-family,bold'                         },
  { nameEn: 'ZZ Plant',            nameEs: 'Planta ZZ',              wiki: 'Zamioculcas',              wikiEs: 'Zamioculcas',              category: 'tropical',  price: 55,  care: 'easy',     sun: 'shade',   water: 'low',      tags: 'indoor,drought-tolerant,glossy,easy-care'                      },

  // ── Native Florida ────────────────────────────────────────────────────────
  { nameEn: 'Buttonwood',          nameEs: 'Botoncillo',             wiki: 'Conocarpus erectus',       wikiEs: 'Conocarpus erectus',       category: 'native',    price: 55,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'native,coastal,salt-tolerant,hedge'                             },
  { nameEn: 'Fakahatchee Grass',   nameEs: 'Hierba Fakahatchee',     wiki: 'Tripsacum dactyloides',    wikiEs: 'Tripsacum dactyloides',    category: 'native',    price: 22,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'native,ornamental-grass,wildlife'                               },
  { nameEn: 'Firebush',            nameEs: 'Arbusto de Fuego',       wiki: 'Hamelia patens',           wikiEs: 'Hamelia patens',           category: 'native',    price: 18,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'native,butterfly,hummingbird,drought-tolerant', featured: true },
  { nameEn: 'Mangrove',            nameEs: 'Mangle',                 wiki: 'Rhizophora mangle',        wikiEs: 'Rhizophora mangle',        category: 'native',    price: 45,  care: 'moderate', sun: 'full',    water: 'high',     tags: 'native,coastal,ecological,water-edge'                           },
  { nameEn: 'Muhly Grass',         nameEs: 'Hierba Muhly',           wiki: 'Muhlenbergia capillaris',  wikiEs: 'Muhlenbergia capillaris',  category: 'native',    price: 22,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'native,ornamental-grass,pink,fall-color'                        },
  { nameEn: 'Saw Palmetto',        nameEs: 'Palma Serrada',          wiki: 'Serenoa repens',           wikiEs: 'Serenoa repens',           category: 'native',    price: 55,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'native,wildlife,drought-tolerant,florida'                       },
  { nameEn: 'Sea Grape',           nameEs: 'Uva de Mar',             wiki: 'Coccoloba uvifera',        wikiEs: 'Coccoloba uvifera',        category: 'native',    price: 55,  care: 'easy',     sun: 'full',    water: 'low',      tags: 'native,coastal,edible,salt-tolerant'                            },

  // ── Edible ───────────────────────────────────────────────────────────────
  { nameEn: 'Avocado Tree',        nameEs: 'Aguacate',               wiki: 'Avocado',                  wikiEs: 'Aguacate',                 category: 'edible',    price: 89,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'edible,fruit,shade,backyard',               featured: true  },
  { nameEn: 'Lemon Tree',          nameEs: 'Limonero',               wiki: 'Lemon',                    wikiEs: 'Limón',                    category: 'edible',    price: 65,  care: 'moderate', sun: 'full',    water: 'moderate', tags: 'edible,container,fragrant,fruit',            featured: true  },
  { nameEn: 'Lime Tree',           nameEs: 'Limero',                 wiki: 'Lime (fruit)',             wikiEs: 'Lima (fruta)',             category: 'edible',    price: 65,  care: 'moderate', sun: 'full',    water: 'moderate', tags: 'edible,container,fragrant,fruit'                                },
  { nameEn: 'Mango Tree',          nameEs: 'Mango',                  wiki: 'Mango',                    wikiEs: 'Mangifera indica',         category: 'edible',    price: 95,  care: 'easy',     sun: 'full',    water: 'moderate', tags: 'edible,shade,tropical,fruit',               featured: true  },
  { nameEn: 'Orange Tree',         nameEs: 'Naranjo',                wiki: 'Orange (fruit)',           wikiEs: 'Naranja',                  category: 'edible',    price: 65,  care: 'moderate', sun: 'full',    water: 'moderate', tags: 'edible,fragrant,fruit,container'                                },
  { nameEn: 'Papaya',              nameEs: 'Papaya',                 wiki: 'Papaya',                   wikiEs: 'Papaya',                   category: 'edible',    price: 35,  care: 'easy',     sun: 'full',    water: 'high',     tags: 'edible,fast-growing,tropical,fruit'                             },

  // ── Succulents ────────────────────────────────────────────────────────────
  { nameEn: 'Adenium',             nameEs: 'Rosa del Desierto',      wiki: 'Adenium obesum',           wikiEs: 'Adenium obesum',           category: 'succulents', price: 38, care: 'moderate', sun: 'full',    water: 'low',      tags: 'succulent,flowering,drought-tolerant,container'                 },
  { nameEn: 'Aloe Vera',           nameEs: 'Aloe Vera',              wiki: 'Aloe vera',                wikiEs: 'Aloe vera',                category: 'succulents', price: 25, care: 'easy',     sun: 'full',    water: 'low',      tags: 'medicinal,succulent,drought-tolerant,useful', featured: true },
  { nameEn: 'Crown of Thorns',     nameEs: 'Corona de Espinas',      wiki: 'Euphorbia milii',          wikiEs: 'Euphorbia milii',          category: 'succulents', price: 22, care: 'easy',     sun: 'full',    water: 'low',      tags: 'succulent,flowering,drought-tolerant,fence'                     },
  { nameEn: 'Echeveria',           nameEs: 'Echeveria',              wiki: 'Echeveria',                wikiEs: 'Echeveria',                category: 'succulents', price: 18, care: 'easy',     sun: 'full',    water: 'low',      tags: 'succulent,rosette,drought-tolerant,container'                   },
  { nameEn: 'Sedum',               nameEs: 'Sedum',                  wiki: 'Sedum',                    wikiEs: 'Sedum',                    category: 'succulents', price: 18, care: 'easy',     sun: 'full',    water: 'low',      tags: 'succulent,groundcover,drought-tolerant,container'               },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function fetchWikiSummary(title: string): Promise<{ imageUrl: string | null; extract: string }> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    )
    if (!res.ok) return { imageUrl: null, extract: '' }
    const data: any = await res.json()
    const thumb    = data.thumbnail?.source  as string | undefined
    const original = data.originalimage?.source as string | undefined
    // Use direct file URL (strip /thumb/ and size suffix) — thumbnail URLs return HTTP 400
    const imageUrl = thumb
      ? thumb.replace('/thumb/', '/').replace(/\/\d+px-[^/]+$/, '')
      : (original ?? null)
    // First paragraph, max 450 chars
    const extract  = (data.extract ?? '').split('\n')[0].slice(0, 450)
    return { imageUrl, extract }
  } catch {
    return { imageUrl: null, extract: '' }
  }
}

async function fetchWikiExtractEs(title: string): Promise<string> {
  try {
    const res = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    )
    if (!res.ok) return ''
    const data: any = await res.json()
    return (data.extract ?? '').split('\n')[0].slice(0, 450)
  } catch {
    return ''
  }
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 800): Promise<T> {
  for (let i = 0; i < retries; i++) {
    const result = await fn()
    if (result !== null && (result as any) !== '') return result
    await delay(backoff * (i + 1))
  }
  return fn()
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80'

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 Seeding ${PLANTS.length} plants into the catalog…\n`)

  let created = 0, updated = 0, noImg = 0

  for (const p of PLANTS) {
    // Fetch English image + description
    const { imageUrl, extract: descEn } = await fetchWithRetry(() => fetchWikiSummary(p.wiki))
    await delay(350)

    // Fetch Spanish description
    const descEs = await fetchWithRetry(() => fetchWikiExtractEs(p.wikiEs ?? p.nameEs))
    await delay(350)

    const imageUrlFinal = imageUrl ?? FALLBACK_IMG
    if (!imageUrl) noImg++

    const data = {
      nameEn:         p.nameEn,
      nameEs:         p.nameEs,
      descriptionEn:  descEn  || `${p.nameEn} thrives in South Florida's warm, humid climate and is an excellent addition to Miami gardens.`,
      descriptionEs:  descEs  || descEn || `${p.nameEs} prospera en el cálido y húmedo clima del sur de Florida.`,
      price:          p.price,
      imageUrl:       imageUrlFinal,
      category:       p.category,
      inStock:        true,
      featured:       p.featured ?? false,
      tags:           p.tags,
      careLevel:      p.care,
      sunlight:       p.sun,
      water:          p.water,
    }

    // Upsert by nameEn (no unique constraint, so use findFirst + create/update)
    const existing = await prisma.plant.findFirst({ where: { nameEn: p.nameEn } })
    if (existing) {
      await prisma.plant.update({ where: { id: existing.id }, data })
      updated++
    } else {
      await prisma.plant.create({ data })
      created++
    }

    const imgStatus = imageUrl ? '🖼 ' : '⚠️  no img'
    console.log(`  ${imageUrl ? '✅' : '⚠️'} ${p.nameEn.padEnd(28)} ${imgStatus}`)
  }

  const total = await prisma.plant.count()
  console.log(`
─────────────────────────────────────────
✅ Done!  created=${created}  updated=${updated}  no-image=${noImg}
📦 Total plants in catalog: ${total}
─────────────────────────────────────────
`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
