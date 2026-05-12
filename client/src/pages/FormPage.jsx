import { Container } from 'react-bootstrap'
import ReceiptForm from '../components/ReceiptForm'

function FormPage() {
  return (
    <div className="page-container" style={{ paddingTop: '0rem' }}>
      <Container>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <ReceiptForm />
        </div>
      </Container>
    </div>
  )
}

export default FormPage