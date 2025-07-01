const checkCUIT=(cc)=>{		
    // Eliminar todo lo que no sea dígito
    const limpio = cc.replace(/\D/g, '');
    if (limpio.length !== 11) return false;

    const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    // Sumar cada dígito (los primeros 10) por su peso
    for (let i = 0; i < 10; i++) {
        suma += parseInt(limpio[i], 10) * pesos[i];
    }

    // Calcular dígito verificador
    const resto = suma % 11;
    let dv = 11 - resto;
    if (dv === 11) dv = 0;
    else if (dv === 10) dv = 9;

    // Comparar con el último dígito del CUIT    
    return dv === parseInt(limpio[10], 10);
}

const timeNow=()=>{
    let date_time=new Date();
    let date=("0" + date_time.getDate()).slice(-2);
    let month=("0" + (date_time.getMonth() + 1)).slice(-2);
    let year=date_time.getFullYear();
    let hours=("0" + date_time.getHours()).slice(-2);
    let minutes=("0" + date_time.getMinutes()).slice(-2);
    let seconds=("0" + date_time.getSeconds()).slice(-2);
    let fecha=year+"-"+date+"-"+month+" "+hours+":"+minutes+":"+seconds;
    return fecha;
}

module.exports={ checkCUIT, timeNow }