import { Container, Typography, Box, Divider } from "@mui/material";

function PoliticaPrivacidad() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>
        Política de Privacidad
      </Typography>

      <Typography variant="body2" sx={{ mb: 4 }}>
        Última actualización: 03/03/2026 – Versión 1.0
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. Responsable del tratamiento
        </Typography>
        <Typography variant="body1">
          Titular: Inaltera <br />
          NIF/CIF: 71902382N <br />
          Domicilio: Asipo II <br />
          Email de contacto: contacto@inaltera.es
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          2. Datos que recopilamos
        </Typography>
        <Typography variant="body1">
          Recogemos los siguientes datos personales:
        </Typography>
        <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
          <li>Nombre y apellidos o razón social.</li>
          <li>Correo electrónico.</li>
          <li>Datos fiscales necesarios para la emisión de facturas.</li>
          <li>
            Información técnica necesaria para el funcionamiento del servicio.
          </li>
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          3. Finalidad del tratamiento
        </Typography>
        <Typography variant="body1">
          Los datos se tratan con las siguientes finalidades:
        </Typography>
        <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
          <li>Gestionar el registro de usuarios.</li>
          <li>Permitir la emisión y gestión de facturas.</li>
          <li>Cumplir obligaciones legales y fiscales.</li>
          <li>Garantizar la seguridad del servicio.</li>
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          4. Base jurídica
        </Typography>
        <Typography variant="body1">
          La base legal para el tratamiento es:
        </Typography>
        <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
          <li>La ejecución del contrato al registrarse en la plataforma.</li>
          <li>El cumplimiento de obligaciones legales aplicables.</li>
          <li>El consentimiento del usuario.</li>
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          5. Conservación de los datos
        </Typography>
        <Typography variant="body1">
          Los datos se conservarán mientras exista relación contractual y
          posteriormente durante los plazos legalmente exigidos en materia
          fiscal y mercantil.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          6. Destinatarios
        </Typography>
        <Typography variant="body1">
          No se cederán datos a terceros salvo obligación legal o cuando sea
          necesario para la prestación del servicio (por ejemplo, proveedores de
          hosting).
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          7. Derechos del usuario
        </Typography>
        <Typography variant="body1">
          El usuario puede ejercer los siguientes derechos:
        </Typography>
        <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
          <li>Acceso</li>
          <li>Rectificación</li>
          <li>Supresión</li>
          <li>Oposición</li>
          <li>Limitación del tratamiento</li>
          <li>Portabilidad</li>
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Para ejercerlos puede enviar una solicitud a: [EMAIL DE CONTACTO]
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Asimismo, puede presentar reclamación ante la Agencia Española de
          Protección de Datos (www.aepd.es).
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          8. Seguridad
        </Typography>
        <Typography variant="body1">
          Aplicamos medidas técnicas y organizativas adecuadas para garantizar
          la seguridad de los datos personales.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          9. Cambios en la política
        </Typography>
        <Typography variant="body1">
          Nos reservamos el derecho a modificar la presente política para
          adaptarla a novedades legislativas o cambios en el servicio. En caso
          de cambios relevantes, se notificará a los usuarios.
        </Typography>
      </Box>
    </Container>
  );
}

export default PoliticaPrivacidad;
