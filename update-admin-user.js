// Script para actualizar el perfil de usuario a administrador en MongoDB
// Ejecuta este script con: node update-admin-user.js

const { MongoClient } = require('mongodb');

// Reemplaza con tu connection string de MongoDB
const MONGO_URI = 'tu_connection_string_aqui';

async function updateUserToAdmin() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db(); // Usa la base de datos por defecto del connection string
    const usuarios = db.collection('usuarios');
    
    // Actualiza el usuario por email
    const result = await usuarios.updateOne(
      { email: 'joacoferman1@gmail.com' }, // Reemplaza con tu email
      { $set: { perfil: 'administrador' } }
    );
    
    if (result.matchedCount === 0) {
      console.log('Usuario no encontrado');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Usuario actualizado exitosamente a administrador');
    } else {
      console.log('El usuario ya tenía perfil de administrador');
    }
    
    // Verifica el cambio
    const usuario = await usuarios.findOne(
      { email: 'joacoferman1@gmail.com' },
      { projection: { email: 1, nombreUsuario: 1, perfil: 1, _id: 0 } }
    );
    console.log('Estado actual del usuario:', usuario);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Desconectado de MongoDB');
  }
}

updateUserToAdmin();
