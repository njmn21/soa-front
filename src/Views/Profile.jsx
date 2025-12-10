import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Modals/Navbar';
import Footer from './Modals/Footer';
import { useAuth } from '../Service/useAuth';
import cuentaService from '../Service/profileServices';
import '../css/MarketplaceTheme.css';

const MiCuenta = () => {
  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const navigate = useNavigate();
  
  // Mismo patrón que Favorites - incluir isAuthenticated y authLoading
  const { requireAuth, getIdCliente, user, isAuthenticated, loading: authLoading } = useAuth();

  // Estados para el formulario de producto
  const [formData, setFormData] = useState({
    descripcion: '',
    categoria: '',
    precio: '',
    estado: true,
    ruta_imagen: ''
  });

  useEffect(() => {
    
    // Exactamente el mismo patrón que Favorites
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    cargarDatosUsuario();
  }, [isAuthenticated, authLoading, navigate]);

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      setError('');

      // Misma lógica que Favorites para obtener el ID
      const idCliente = getIdCliente();
      
      if (!idCliente) {
        setError('No se pudo identificar al usuario');
        return;
      }

      // Cargar datos del usuario y productos en paralelo
      const [datosUsuario, productosUsuario] = await Promise.all([
        cuentaService.obtenerUsuario(idCliente),
        cuentaService.obtenerPrendasUsuario(idCliente)
      ]);

      setCliente(datosUsuario);
      setProductos(productosUsuario);
      
    } catch (err) {
      setError('Error al cargar la información de la cuenta: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitLoading(true);
      const idCliente = getIdCliente();
      
      if (!idCliente) {
        alert('No se pudo identificar al cliente');
        return;
      }

      const productoData = {
        ...formData,
        id_cliente: idCliente,
        precio: parseFloat(formData.precio),
        // Asegurar que la ruta de imagen tenga el formato correcto
        ruta_imagen: formData.ruta_imagen || 'default.jpg'
      };

      if (editingProduct) {
        // Editar producto existente
        await cuentaService.actualizarPrenda(editingProduct.id, productoData);
        alert('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await cuentaService.crearPrenda(productoData);
        alert('Producto creado correctamente');
      }

      // Recargar datos
      await cargarDatosUsuario();
      
      // Limpiar formulario
      setFormData({
        descripcion: '',
        categoria: '',
        precio: '',
        estado: true,
        ruta_imagen: ''
      });
      setEditingProduct(null);
      setShowForm(false);
      
    } catch (err) {
      alert('Error al guardar el producto. Por favor, intenta nuevamente.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio: producto.precio.toString(),
      estado: producto.estado,
      ruta_imagen: producto.ruta_imagen || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (productoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await cuentaService.eliminarPrenda(productoId);
      alert('Producto eliminado correctamente');
      await cargarDatosUsuario();
    } catch (err) {
      alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      descripcion: '',
      categoria: '',
      precio: '',
      estado: true,
      ruta_imagen: ''
    });
  };

  // Mismo manejo de loading que Favorites
  if (authLoading) {
    return (
      <div className="marketplace-bg min-vh-100">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border loading-spinner" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted fw-semibold">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (ya se redirige en useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Loading de datos específicos de la cuenta - igual que Favorites
  if (loading) {
    return (
      <div className="marketplace-bg min-vh-100">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border loading-spinner" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted fw-semibold">Cargando información de tu cuenta...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-bg min-vh-100">
      <Navbar />
      
      {/* Header de la página */}
      <div className="container my-5">
        <div className="row">
          <div className="col-12">
            <h1 className="section-header mb-4">Mi Cuenta</h1>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <div className="mt-3">
              <button className="btn product-btn product-btn-primary" onClick={cargarDatosUsuario}>
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div className="row">
          {/* Información del Cliente - Ahora ocupa toda la fila arriba */}
          <div className="col-12 mb-4">
            <div className="profile-card">
              <div className="row align-items-center">
                <div className="col-md-2 text-center">
                  <div className="profile-avatar">
                    <i className="bi bi-person-fill"></i>
                  </div>
                </div>
                <div className="col-md-6">
                  <h3 className="profile-name mb-2">{cliente?.nombre || user?.nombre || 'Usuario'}</h3>
                  <p className="profile-email text-muted mb-3">{cliente?.email || user?.email}</p>
                  <div className="profile-info">
                    <div className="info-item mb-2">
                      <i className="bi bi-telephone me-2"></i>
                      <span>{cliente?.telefono || 'No especificado'}</span>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-geo-alt me-2"></i>
                      <span>{cliente?.direccion || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="profile-stats">
                    <div className="stat-item text-center">
                      <div className="stat-number">{productos.length}</div>
                      <div className="stat-label">Productos Publicados</div>
                    </div>
                    <div className="stat-item text-center">
                      <div className="stat-number">
                        {productos.filter(p => p.estado).length}
                      </div>
                      <div className="stat-label">Productos Activos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal - Ahora ocupa toda la fila debajo */}
          <div className="col-12">
            {/* Botón para agregar producto */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-subheader mb-0">Mis Productos</h2>
              <button 
                className="btn product-btn product-btn-primary"
                onClick={() => setShowForm(true)}
                disabled={submitLoading}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Producto
              </button>
            </div>

            {/* Formulario de Producto */}
            {showForm && (
              <div className="product-form-card mb-4">
                <div className="form-header">
                  <h4>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h4>
                  <button className="btn-close" onClick={cancelForm} disabled={submitLoading}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Descripción *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        required
                        disabled={submitLoading}
                        placeholder="Ej: Camiseta básica de algodón"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Categoría *</label>
                      <select
                        className="form-select"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        required
                        disabled={submitLoading}
                      >
                        <option value="">Seleccionar categoría</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Niños">Niños</option>
                        <option value="Accesorios">Accesorios</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Precio (S/) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        required
                        disabled={submitLoading}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">URL de la Imagen</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ruta_imagen"
                        value={formData.ruta_imagen}
                        onChange={handleInputChange}
                        disabled={submitLoading}
                        placeholder="imagenes/camiseta.jpg"
                      />
                      <div className="form-text">
                        Ruta relativa de la imagen en el servidor (ej: imagenes/mi-producto.jpg)
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="estado"
                          checked={formData.estado}
                          onChange={handleInputChange}
                          disabled={submitLoading}
                        />
                        <label className="form-check-label">
                          Producto disponible
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="form-actions mt-4">
                    <button 
                      type="button" 
                      className="btn product-btn product-btn-outline me-2" 
                      onClick={cancelForm}
                      disabled={submitLoading}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn product-btn product-btn-primary"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          {editingProduct ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de Productos */}
            {productos.length === 0 ? (
              <div className="empty-state text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h4 className="mt-3">No tienes productos publicados</h4>
                <p className="text-muted">Comienza agregando tu primer producto</p>
                <button 
                  className="btn product-btn product-btn-primary mt-3"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Agregar Primer Producto
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {productos.map((producto) => (
                  <div key={producto.id} className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex">
                    <div className="product-card w-100">
                      <img 
                        src={producto.imagen_url || producto.ruta_imagen || 'https://via.placeholder.com/300x300?text=Sin+Imagen'}
                        className="product-image"
                        alt={producto.descripcion}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible';
                        }}
                      />
                      <div className="card-body">
                        <h5 className="product-title">{producto.descripcion}</h5>
                        <p className="product-category">
                          <i className="bi bi-tag me-1"></i>
                          {producto.categoria}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="product-price">S/{producto.precio?.toFixed(2) || '--'}</span>
                          <span className={`badge ${producto.estado ? 'bg-success' : 'bg-secondary'}`}>
                            {producto.estado ? 'Disponible' : 'Agotado'}
                          </span>
                        </div>
                        <div className="product-actions">
                          <div className="d-grid gap-2">
                            <button 
                              className="btn product-btn product-btn-outline"
                              onClick={() => handleEdit(producto)}
                              disabled={submitLoading}
                            >
                              <i className="bi bi-pencil me-2"></i>
                              Editar
                            </button>
                            <button 
                              className="btn product-btn btn-outline-danger"
                              onClick={() => handleDelete(producto.id)}
                              disabled={submitLoading}
                            >
                              <i className="bi bi-trash me-2"></i>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MiCuenta;