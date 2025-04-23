/**
 * @description This file contains utility functions.
 */

export const getJwtToken = () => {
  return $.cookie(`authTokenNewSL`);
};

export const setDefaultAjaxHeaders = () => {
  const jwtToken = getJwtToken();
  if (jwtToken) {
    $.ajaxSetup({
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  }
};
