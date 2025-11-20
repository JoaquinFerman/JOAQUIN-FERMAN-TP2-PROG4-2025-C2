const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://joacoferman_db_user:JUGx2io1go6n0oWU@cluster0.6sbk1kw.mongodb.net/redsocial?retryWrites=true&w=majority';

async function migrateComments() {
  try {
    await mongoose.connect(uri);
    console.log('✓ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('publicaciones');

    // Obtener todas las publicaciones
    const publicaciones = await collection.find({ deleted: { $ne: true } }).toArray();
    console.log(`✓ Encontradas ${publicaciones.length} publicaciones`);

    let totalComments = 0;
    let commentsUpdated = 0;

    for (const pub of publicaciones) {
      if (!pub.comments || pub.comments.length === 0) continue;

      totalComments += pub.comments.length;
      let needsUpdate = false;

      // Revisar cada comentario
      const updatedComments = pub.comments.map(comment => {
        if (!comment._id) {
          needsUpdate = true;
          commentsUpdated++;
          return {
            ...comment,
            _id: new mongoose.Types.ObjectId()
          };
        }
        return comment;
      });

      // Actualizar solo si hay cambios
      if (needsUpdate) {
        await collection.updateOne(
          { _id: pub._id },
          { $set: { comments: updatedComments } }
        );
        console.log(`  ✓ Publicación ${pub._id}: ${updatedComments.length} comentarios actualizados`);
      }
    }

    console.log('\n========================================');
    console.log(`✓ Migración completada`);
    console.log(`  - Total comentarios: ${totalComments}`);
    console.log(`  - Comentarios sin _id: ${commentsUpdated}`);
    console.log(`  - Comentarios con _id: ${totalComments - commentsUpdated}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ Error en migración:', err);
    process.exit(1);
  }
}

migrateComments();
