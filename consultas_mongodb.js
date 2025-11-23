// consultas_mongodb.js

// ===============================================
// REPOSITORIO DE CÓDIGO - CONSULTAS EN MONGODB
// Base de datos: TiendaOnline
// Colección: productos
// ===============================================

// 1. Selección de Base de Datos
use TiendaOnline;

// 2. CONSULTAS BÁSICAS (CRUD)

// Inserción de un documento
db.productos.insertOne({
    nombre: "Laptop Lenovo",
    categoria: "Tecnologia",
    precio: 2800000,
    stock: 12,
    descripcion: "Laptop de alto rendimiento",
    fecha_registro: new Date()
});

// Inserción de múltiples documentos
db.productos.insertMany([
    { nombre: "Audífonos Sony", categoria: "Tecnologia", precio: 180000, stock: 30 },
    { nombre: "Cafetera Oster", categoria: "Hogar", precio: 250000, stock: 20 }
]);

// Selección de documentos
db.productos.find();
db.productos.find({ categoria: "Tecnologia" });

// Actualización
db.productos.updateOne(
    { nombre: "Laptop Lenovo" },
    { $set: { stock: 20 } }
);

db.productos.updateMany(
    { categoria: "Tecnologia" },
    { $set: { oferta: true } }
);

// Eliminación
db.productos.deleteOne({ nombre: "Audífonos Sony" });
db.productos.deleteMany({ categoria: "Hogar" });

// 3. CONSULTAS CON FILTROS Y OPERADORES

db.productos.find({ precio: { $lt: 100000 } });
db.productos.find({ stock: { $gt: 50 } });

db.productos.find({
    categoria: "Tecnologia",
    precio: { $gte: 100000, $lte: 500000 }
});

db.productos.find({
    $or: [
        { categoria: "Tecnologia" },
        { categoria: "Hogar" }
    ]
});

db.productos.find({ nombre: /gamer/i });

// 4. CONSULTAS DE AGREGACIÓN

db.productos.aggregate([
    { $group: { _id: "$categoria", total_productos: { $sum: 1 } } }
]);

db.productos.aggregate([
    { $group: { _id: "$categoria", promedio_precio: { $avg: "$precio" } } }
]);

db.productos.aggregate([
    { $group: { _id: "$categoria", stock_total: { $sum: "$stock" } } }
]);

db.productos.aggregate([
    { $unwind: "$valoraciones" },
    { $group: { _id: "$categoria", promedio_valoracion: { $avg: "$valoraciones.puntuacion" } } }
]);* 1. INSERCIÓN
 ***************/
db.productos.insertMany(docs);


/***************
 * 2. CONSULTAS CRUD
 ***************/

// Seleccionar todos
db.productos.find();

// Insertar un producto individual
db.productos.insertOne({
  nombre: "Laptop Lenovo",
  categoria: "Tecnologia",
  precio: 2800000,
  stock: 12
});

// Actualizar
db.productos.updateOne(
  { nombre: "Laptop Lenovo" },
  { $set: { stock: 20 } }
);

// Eliminar
db.productos.deleteOne({ nombre: "Laptop Lenovo" });


/******************************
 * 3. CONSULTAS CON FILTROS
 ******************************/

// Operadores de comparación
db.productos.find({ precio: { $lt: 100000 } });
db.productos.find({ stock: { $gt: 50 } });

// Operadores lógicos
db.productos.find({
  $or: [
    { categoria: "Tecnologia" },
    { categoria: "Hogar" }
  ]
});

// Filtro combinado
db.productos.find({
  categoria: "Tecnologia",
  precio: { $gte: 100000, $lte: 500000 }
});

// Búsqueda por texto
db.productos.find({ nombre: /gamer/i });


/******************************
 * 4. AGREGACIONES BÁSICAS
 ******************************/

// Contar productos por categoría
db.productos.aggregate([
  { $group: { _id: "$categoria", total_productos: { $sum: 1 } } }
]);

// Promedio de precios por categoría
db.productos.aggregate([
  { $group: { _id: "$categoria", promedio_precio: { $avg: "$precio" } } }
]);

// Stock total por categoría
db.productos.aggregate([
  { $group: { _id: "$categoria", stock_total: { $sum: "$stock" } } }
]);

// Promedio de valoraciones
db.productos.aggregate([
  { $unwind: "$valoraciones" },
  { $group: { _id: "$categoria", promedio_valoracion: { $avg: "$valoraciones.puntuacion" } } }
]);


/************************************
 * 5. CONSULTAS AVANZADAS (PIPELINES)
 ************************************/

// 5.1 – Top 5 productos más caros por categoría
db.productos.aggregate([
  { $sort: { categoria: 1, precio: -1 } },
  { $group: {
      _id: "$categoria",
      topProductos: { $push: { nombre: "$nombre", precio: "$precio", stock: "$stock" } }
  }},
  { $project: { topProductos: { $slice: ["$topProductos", 5] } } }
]);


// 5.2 – Estadísticas por categoría
db.productos.aggregate([
  { $group: {
      _id: "$categoria",
      total_productos: { $sum: 1 },
      promedio_precio: { $avg: "$precio" },
      stock_total: { $sum: "$stock" },
      sin_stock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } }
  }},
  { $project: {
      promedio_precio: { $round: ["$promedio_precio", 0] },
      total_productos: 1,
      stock_total: 1,
      sin_stock: 1
  }},
  { $sort: { stock_total: -1 } }
]);


// 5.3 – Analítica con FACET
db.productos.aggregate([
  { $facet: {
      resumen: [
        { $group: { _id: null, total: { $sum: 1 }, precio_promedio: { $avg: "$precio" } } },
        { $project: { _id: 0, total: 1, precio_promedio: { $round: ["$precio_promedio", 0] } } }
      ],
      top_categorias: [
        { $group: { _id: "$categoria", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ],
      distribucion_precio: [
        { $bucketAuto: { groupBy: "$precio", buckets: 5 } }
      ]
  }}
]);


// 5.4 – JOIN usando $lookup (ventas por producto)
db.productos.aggregate([
  { $lookup: {
      from: "ordenes",
      let: { prodNombre: "$nombre" },
      pipeline: [
        { $unwind: "$items" },
        { $match: { $expr: { $eq: ["$items.producto_nombre", "$$prodNombre"] } } },
        { $group: {
            _id: "$items.producto_nombre",
            cantidad_vendida: { $sum: "$items.cantidad" },
            ingreso: { $sum: { $multiply: ["$items.cantidad", "$items.precio_unitario"] } }
        }}
      ],
      as: "ventas"
  }},
  { $unwind: { path: "$ventas", preserveNullAndEmptyArrays: true } },
  { $project: {
      nombre: 1, categoria: 1, precio: 1, stock: 1,
      cantidad_vendida: { $ifNull: ["$ventas.cantidad_vendida", 0] },
      ingreso: { $ifNull: ["$ventas.ingreso", 0] }
  }},
  { $sort: { ingreso: -1 } }
]);


// 5.5 – Precio IVA y precio con descuento
db.productos.aggregate([
  { $project: {
      nombre: 1,
      categoria: 1,
      precio: 1,
      precio_iva: { $round: [{ $multiply: ["$precio", 1.19] }, 0] },
      precio_oferta: {
        $cond: [
          { $gt: ["$stock", 50] },
          { $round: [{ $multiply: ["$precio", 0.90] }, 0] },
          "$precio"
        ]
      }
  }},
  { $sort: { precio_iva: -1 } }
]); 

