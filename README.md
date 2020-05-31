# xml.cds.net.co
Servicio de generación de XML a traves de un JSON (Facturación electrónica).

## Como usar en los microservicios de cds ##

1. Invoque la url "http://xml.cds.net.co"  para servir un documento xml 
    (Se crea y se devuelve un arreglo con data del documento)
    
        {
            path:'http://localhost:5033/sources/temp/xml/', 
            file: 'invoice_' + req.body.empresa.nit + '_' + req.body.cliente.documento + '_' + req.body.factura_no + '.xml',
            msg: 'sources/temp/xml/invoice_' + req.body.empresa.nit + '_' + req.body.cliente.documento + '_' + req.body.factura_no + '.xml'
        }
        
3.  Invoque desde la app y envie su data en formato JSON de la factura.

        //#region FACTURACION ELECTRONICA
        
        $http.defaults.headers.post["Content-Type"] = "application/json";
        $http.post('http://localhost:5033/api/gfactura', datas).success(function (data) {
            console.log('Se genero xml de factura electrónica: ', data.msg);
        });
        
        //#endregion
