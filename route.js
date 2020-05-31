const moment = require('moment');

module.exports = function (app) {

    //#region PROPIEDADES PDF
    const opciones = {format: 'A2', quality: 300};
    //#endregion

    //#region METODOS PARA FORMATEAR DATA
    function formatearNumero(numero) {
        numero = parseFloat(numero).toFixed(1);
        var n = numero.toString().split(".");
        n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return n.join(".");
    }


    //#endregion

    //#region METODOS PARA GENERAR JSON - para pruebas
    async function generarJSON(req, res) {
        const data = {
            empresa: {
                nombre: req.body.empresa
            },
            cliente: {},
            productos: [],
            factura: req.body.factura,
            fecha_creacion: moment().format('DD/MM/YYYY'),
            fecha_vencimiento: moment().add(14, 'days').format('DD/MM/YYYY')
        };

        res.status(200).send({msg: data});
    }


    //#endregion

    //#region METODOS PARA LA GENERACIÓN DEL DOCUMENTO PDF
    async function generarPDFFactura(req, res) {
        const data = {
            empresa: {
                nombre: req.body.empresa.empresa,
                direccion: 'Calle ' + req.body.empresa.direccion.calle + ' # ' + req.body.empresa.direccion.numero + ' Manzana ' +
                    req.body.empresa.direccion.manzana + ', ' + req.body.empresa.direccion.barrio,
                ciudad: req.body.empresa.direccion.municipio + ', ' + req.body.empresa.direccion.departamento,
                nit: req.body.empresa.nit
            },
            cliente: {},
            productos: [],
            factura_no: req.body.factura_no,
            fecha_creacion: moment().format('DD/MM/YYYY'),
            fecha_vencimiento: moment().add(14, 'days').format('DD/MM/YYYY')
        };

        data.tituloFactura = 'Factura de venta';
        data.logo = req.body.logo;
        data.cliente = {
            documento: req.body.cliente.documento,
            nombre: req.body.cliente.nombre,
            email: req.body.cliente.email,
        };

        const productos = req.body.productos;

        for (let i = 0; i < productos.length; i++) {
            data.productos.push({
                producto: productos[i].itemMedicamento.nombreGenerico,
                cantidad: productos[i].cantidad,
                precio: formatearNumero(productos[i].precioUnitario),
                subtotal: formatearNumero(productos[i].subtotal),
                total: formatearNumero(productos[i].total),
            });
        }

        const total = data.productos.map(producto => producto.precio).reduce((a, b) => a + b, 0);
        data.subtotal = formatearNumero(req.body.factura.subtotal);
        data.total = formatearNumero(req.body.factura.total);
        data.productos.forEach(producto => producto.precio = producto.precio);
        var fs = require('fs');
        var convert = require('xml-js');
        var options = {compact: true, ignoreComment: true, spaces: 4};
        var result = convert.json2xml(data, options);

        await fs.writeFileSync('./sources/temp/xml/invoice_' + req.body.empresa.nit + '_' + req.body.cliente.documento + '_' + req.body.factura_no + '.xml', result);

        res.status(200).send({
            //path: 'http://xml.cds.net.co/sources/temp/pdf/', //PRODUCCION
            path:'http://localhost:5033/sources/temp/xml/', //DESARROLLO
            file: 'invoice_' + req.body.empresa.nit + '_' + req.body.cliente.documento + '_' + req.body.factura_no + '.xml',
            msg: 'sources/temp/pdf/invoice_' + req.body.empresa.nit + '_' + req.body.cliente.documento + '_' + req.body.factura_no + '.xml'
        });
    }

    //#endregion

    //#region ENDPOINTS PARA SERVIR DOCUMENTOS

    //#region ENDPOINTS PARA PRUEBAS
    app.post('/api/gfacturass', function (req, res) {
        generarJSON(req, res)
    });
    app.get('/api/gfacturas', function (req, res) {
        res.send({msg: req.body})
    });
    //#endregion

    //#region PRODUCCIÓN
    app.post('/api/gfactura', function (req, res) {
        generarPDFFactura(req, res);
    });
    app.post('/api/gnotacredito', function (req, res) {
        generarPDFCotizacion(req, res);
    });
    app.post('/api/gnotadebito', function (req, res) {
        generarPDFCajaControl(req, res);
    });
    app.get('/api/inicio', function (req, res) {
        res.send({msg: 'Servidor iniciado ...'})
    });
    //#endregion

    //#endregion
};
