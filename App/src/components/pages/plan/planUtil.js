import isEqual from 'lodash/isEqual';

export function shouldUpdateComponent(nextProps, nextState, props, state, propertyToExclude) {
  const nextPropsExcluded = {...nextProps};
  const propsExcluded = {...props};
  nextPropsExcluded[propertyToExclude] = propsExcluded[propertyToExclude] = null;

  if (isEqual(nextPropsExcluded, propsExcluded) && isEqual(nextState, state)) {
    return false;
  }
  else {
    return true;
  }
}