import PropTypes from 'prop-types';
import uniq from 'lodash/uniq';
import { useEffect, useMemo, useCallback } from 'react';
// hooks
import { useLocalStorage } from 'src/hooks/use-local-storage';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// _mock
import { PRODUCT_CHECKOUT_STEPS } from 'src/_mock/_product';
//
import { CheckoutContext } from './checkout-context';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'checkout';

const initialState = {
  activeStep: 0,
  items: [],
  subTotal: 0,
  total: 0,
  discount: 0,
  shipping: 0,
  billing: null,
  totalItems: 0,
};

export function CheckoutProvider({ children }) {
  const router = useRouter();

  const [values, setValues] = useLocalStorage(STORAGE_KEY, initialState);

  const setValue = useCallback(
    (name, value) => {
      setValues((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setValues]
  );

  const onGetCart = useCallback(() => {
    const totalItems = values.items.reduce((total, item) => total + item.quantity, 0);

    const subTotal = values.items.reduce((total, item) => total + item.quantity * item.price, 0);

    setValue('subTotal', subTotal);
    setValue('totalItems', totalItems);
    setValue('billing', values.activeStep === 1 ? null : values.billing);
    setValue('discount', values.items.length ? values.discount : 0);
    setValue('shipping', values.items.length ? values.shipping : 0);
    setValue('total', values.subTotal - values.discount + values.shipping);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values.items,
    values.activeStep,
    values.billing,
    values.discount,
    values.shipping,
    values.subTotal,
  ]);

  useEffect(() => {
    onGetCart();
  }, [onGetCart]);

  const onAddToCart = useCallback(
    (newItem) => {
      const updatedItems = values.items.map((item) => {
        if (item.id === newItem.id) {
          return {
            ...item,
            colors: uniq([...item.colors, ...newItem.colors]),
            quantity: item.quantity + 1,
          };
        }
        return item;
      });

      if (!updatedItems.some((item) => item.id === newItem.id)) {
        updatedItems.push(newItem);
      }

      setValue('items', updatedItems);
    },
    [setValue, values.items]
  );

  const onDeleteCart = useCallback(
    (itemId) => {
      const updatedItems = values.items.filter((item) => item.id !== itemId);

      setValue('items', updatedItems);
    },
    [setValue, values.items]
  );

  const onBackStep = useCallback(() => {
    setValue('activeStep', values.activeStep - 1);
  }, [setValue, values.activeStep]);

  const onNextStep = useCallback(() => {
    setValue('activeStep', values.activeStep + 1);
  }, [setValue, values.activeStep]);

  const onGotoStep = useCallback(
    (step) => {
      setValue('activeStep', step);
    },
    [setValue]
  );

  const onIncreaseQuantity = useCallback(
    (itemId) => {
      const updatedItems = values.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });

      setValue('items', updatedItems);
    },
    [setValue, values.items]
  );

  const onDecreaseQuantity = useCallback(
    (itemId) => {
      const updatedItems = values.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }
        return item;
      });

      setValue('items', updatedItems);
    },
    [setValue, values.items]
  );

  const onCreateBilling = useCallback(
    (address) => {
      setValue('billing', address);

      onNextStep();
    },
    [onNextStep, setValue]
  );

  const onApplyDiscount = useCallback(
    (discount) => {
      setValue('discount', discount);
    },
    [setValue]
  );

  const onApplyShipping = useCallback(
    (shipping) => {
      setValue('shipping', shipping);
    },
    [setValue]
  );

  const completed = values.activeStep === PRODUCT_CHECKOUT_STEPS.length;

  // Reset
  const onReset = useCallback(() => {
    if (completed) {
      setValues(initialState);
      router.replace(paths.product.root);
    }
  }, [completed, router, setValues]);

  const memoizedValue = useMemo(
    () => ({
      ...values,
      completed,
      //
      onAddToCart,
      onDeleteCart,
      //
      onIncreaseQuantity,
      onDecreaseQuantity,
      //
      onCreateBilling,
      onApplyDiscount,
      onApplyShipping,
      //
      onBackStep,
      onNextStep,
      onGotoStep,
      //
      onReset,
    }),
    [
      completed,
      onAddToCart,
      onApplyDiscount,
      onApplyShipping,
      onBackStep,
      onCreateBilling,
      onDecreaseQuantity,
      onDeleteCart,
      onGotoStep,
      onIncreaseQuantity,
      onNextStep,
      onReset,
      values,
    ]
  );

  return <CheckoutContext.Provider value={memoizedValue}>{children}</CheckoutContext.Provider>;
}

CheckoutProvider.propTypes = {
  children: PropTypes.node,
};
