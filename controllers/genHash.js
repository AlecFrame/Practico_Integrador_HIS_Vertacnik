import bcrypt from 'bcrypt';

async function generarHash() {
    const password = "temporal1234"; // contraseña de prueba
    const hash = await bcrypt.hash(password, 10);
    console.log("Hash generado:");
    console.log(hash);
}

generarHash();