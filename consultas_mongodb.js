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
]);
