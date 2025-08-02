import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import InformacionBasica from '../components/creacion/InformacionBasica';
import IngredientesForm from '../components/creacion/IngredientesForm';
import InstruccionesForm from '../components/creacion/InstruccionesForm';
import ImagenForm from '../components/creacion/ImagenForm';
import ResumenCreacion from '../components/creacion/ResumenCreacion';
import StepIndicator from '../components/creacion/StepIndicator';
import { CheckCircleIcon } from '../components/icons/Icons';
import { useCocktails } from '../hooks/useCocktails';

function CrearPage() {
  const { navigateTo } = useNavigation();
  const { createCocktail } = useCocktails();

  // Estado del formulario multi-paso
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Información básica
    name: '',
    description: '',
    difficulty: 'muy fácil',
    glass_type: '',
    garnish: '',
    serving_suggestion: '',
    alcohol_content: null,
    preparation_time: null,

    // Ingredientes (CU_01)
    ingredients: [],

    // Instrucciones (CU_02)
    instructions: [],

    // Imagen (CU_03)
    image_url: '',
    image_file: null,
    image_credits: '',
    image_alt: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_submitError, setSubmitError] = useState(null);

  const steps = useMemo(
    () => [
      {
        id: 'basica',
        title: 'Información Básica',
        description: 'Nombre, descripción y detalles generales',
      },
      {
        id: 'ingredientes',
        title: 'Ingredientes',
        description: 'Añade ingredientes y cantidades (CU_01)',
      },
      {
        id: 'instrucciones',
        title: 'Instrucciones',
        description: 'Pasos de preparación detallados (CU_02)',
      },
      {
        id: 'imagen',
        title: 'Imagen',
        description: 'Foto del cóctel (opcional) (CU_03)',
      },
      {
        id: 'resumen',
        title: 'Resumen',
        description: 'Revisar y guardar (CU_04)',
      },
    ],
    [],
  );

  // Actualizar datos del formulario
  const updateFormData = useCallback(newData => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Validaciones por paso
  const validateStep = useCallback(
    stepIndex => {
      const step = steps[stepIndex];

      switch (step.id) {
        case 'basica':
          if (!formData.name?.trim()) {
            return 'El nombre del cóctel es obligatorio';
          }
          if (!formData.difficulty) {
            return 'Selecciona una dificultad';
          }
          break;

        case 'ingredientes': {
          if (!formData.ingredients || formData.ingredients.length === 0) {
            return 'Agrega al menos un ingrediente';
          }
          // Validar que no haya ingredientes duplicados
          const names = formData.ingredients.map(ing => ing.name?.toLowerCase().trim());
          const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
          if (duplicates.length > 0) {
            return 'No se permiten ingredientes duplicados';
          }
          // Validar cantidades
          const invalidQuantity = formData.ingredients.find(
            ing => !ing.quantity || parseFloat(ing.quantity) <= 0,
          );
          if (invalidQuantity) {
            return 'Todas las cantidades deben ser mayores a 0';
          }
          break;
        }

        case 'instrucciones': {
          if (!formData.instructions || formData.instructions.length === 0) {
            return 'Agrega al menos una instrucción';
          }
          const emptyStep = formData.instructions.find(
            instruction => !instruction.description?.trim(),
          );
          if (emptyStep) {
            return 'Todas las instrucciones deben tener contenido';
          }
          break;
        }

        case 'imagen':
          // Opcional - no hay validación requerida
          break;

        case 'resumen': {
          // Validación final
          if (!formData.name?.trim()) {
            return 'Falta el nombre del cóctel';
          }
          if (!formData.ingredients || formData.ingredients.length === 0) {
            return 'Faltan ingredientes';
          }
          if (!formData.instructions || formData.instructions.length === 0) {
            return 'Faltan instrucciones';
          }
          break;
        }

        default:
          return null;
      }

      return null;
    },
    [formData, steps],
  );

  // Navegar entre pasos
  const goToStep = useCallback(
    stepIndex => {
      if (stepIndex < currentStep) {
        // Permitir ir hacia atrás sin validación
        setCurrentStep(stepIndex);
      } else if (stepIndex > currentStep) {
        // Validar paso actual antes de avanzar
        const validation = validateStep(currentStep);
        if (validation) {
          alert(validation);
          return;
        }
        setCurrentStep(stepIndex);
      }
    },
    [currentStep, validateStep],
  );

  const nextStep = useCallback(() => {
    const validation = validateStep(currentStep);
    if (validation) {
      alert(validation);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Crear cóctel (CU_04)
  const handleSubmit = useCallback(async () => {
    const validation = validateStep(currentStep);
    if (validation) {
      alert(validation);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Preparar datos para el backend
      const cocktailData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        difficulty: formData.difficulty,
        glass_type: formData.glass_type?.trim() || null,
        garnish: formData.garnish?.trim() || null,
        serving_suggestion: formData.serving_suggestion?.trim() || null,
        alcohol_content: formData.alcohol_content || null,
        preparation_time: formData.preparation_time || null,
        img_url: formData.image_url?.trim() || null,
        id_owner: 1, // TODO: usar usuario actual

        // Ingredientes con formato correcto
        ingredientes: (formData.ingredients || []).map((ing, index) => ({
          id_ingredient: ing.id_ingredient || null, // Si es ingrediente existente
          name: ing.name, // Para ingredientes nuevos
          quantity: parseFloat(ing.quantity),
          unit: ing.unit || 'ml',
          preparation_note: ing.notes?.trim() || null,
          is_optional: ing.is_optional || false,
          order_index: index,
        })),

        // Pasos con formato correcto
        pasos: (formData.instructions || []).map((instruction, index) => ({
          step_number: index + 1,
          instruction: instruction.description.trim(),
          duration: instruction.duration || null,
          is_critical: instruction.is_critical || false,
        })),
      };

      await createCocktail(cocktailData);

      // Éxito - navegar al catálogo
      alert('¡Cóctel creado exitosamente!');
      navigateTo('catalogo');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating cocktail:', error);
      setSubmitError(error.message || 'Error al crear el cóctel');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, formData, validateStep, createCocktail, navigateTo]);

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'basica':
        return <InformacionBasica data={formData} onChange={updateFormData} />;
      case 'ingredientes':
        return <IngredientesForm data={formData} onChange={updateFormData} />;
      case 'instrucciones':
        return <InstruccionesForm data={formData} onChange={updateFormData} />;
      case 'imagen':
        return <ImagenForm data={formData} onChange={updateFormData} />;
      case 'resumen':
        return (
          <ResumenCreacion data={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        );
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Cóctel</h1>
                <p className="text-sm text-gray-500">
                  Paso {currentStep + 1} de {steps.length}: {steps[currentStep].title}
                </p>
              </div>
            </div>

            {currentStep === steps.length - 1 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Cóctel'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={goToStep} />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>

              <button
                onClick={nextStep}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrearPage;
