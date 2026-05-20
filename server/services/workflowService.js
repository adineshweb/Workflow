/**
 * Service to validate workflow status transitions based on roles.
 */

// Rules mapping: currentStatus -> array of objects { to: targetStatus, allowedRoles: [...] }
const TRANSITION_RULES = {
  // Initial state is Submitted (handled on request creation, allowed only for 'User')
  null: [
    { to: 'Submitted', allowedRoles: ['User'] }
  ],
  
  Submitted: [
    { to: 'Approved', allowedRoles: ['Manager'] },
    { to: 'Rejected', allowedRoles: ['Manager'] },
    { to: 'Needs Clarification', allowedRoles: ['Manager'] }
  ],
  
  'Needs Clarification': [
    { to: 'Submitted', allowedRoles: ['User'] }
  ],
  
  Approved: [
    { to: 'Closed', allowedRoles: ['Admin'] }
  ],
  
  Closed: [
    { to: 'Reopened', allowedRoles: ['Admin'] }
  ],
  
  Reopened: [
    { to: 'Approved', allowedRoles: ['Manager'] },
    { to: 'Rejected', allowedRoles: ['Manager'] },
    { to: 'Needs Clarification', allowedRoles: ['Manager'] },
    { to: 'Closed', allowedRoles: ['Admin'] }
  ]
};

/**
 * Validates a transition.
 * @param {string|null} currentStatus 
 * @param {string} targetStatus 
 * @param {string} userRole 
 * @returns {object} { valid: boolean, message: string }
 */
const validateTransition = (currentStatus, targetStatus, userRole) => {
  // Normalize currentStatus
  const statusKey = currentStatus || 'null';
  
  const rules = TRANSITION_RULES[statusKey];
  
  if (!rules) {
    return {
      valid: false,
      message: `Invalid current status: ${currentStatus}`
    };
  }
  
  const matchedRule = rules.find(rule => rule.to === targetStatus);
  
  if (!matchedRule) {
    return {
      valid: false,
      message: `Transition from '${statusKey}' to '${targetStatus}' is not allowed.`
    };
  }
  
  if (!matchedRule.allowedRoles.includes(userRole)) {
    return {
      valid: false,
      message: `Role '${userRole}' is not authorized to transition request from '${statusKey}' to '${targetStatus}'.`
    };
  }
  
  return {
    valid: true,
    message: 'Valid transition.'
  };
};

module.exports = {
  validateTransition,
  TRANSITION_RULES
};
