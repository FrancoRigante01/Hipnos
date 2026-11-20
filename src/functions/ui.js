// Snackbar para mostrar mensajes breves
export function showSnackbar(message) {
  let snackbar = document.getElementById('snackbar');
  if (!snackbar) {
    snackbar = document.createElement('div');
    snackbar.id = 'snackbar';
    snackbar.setAttribute('role', 'status');
    snackbar.setAttribute('aria-live', 'polite');
    snackbar.style.position = 'fixed';
    snackbar.style.bottom = '32px';
    snackbar.style.left = '50%';
    snackbar.style.transform = 'translateX(-50%)';
    snackbar.style.background = 'linear-gradient(90deg, #6366f1, #8b5cf6)';
    snackbar.style.color = 'white';
    snackbar.style.padding = '1rem 2rem';
    snackbar.style.borderRadius = '12px';
    snackbar.style.fontSize = '1.1rem';
    snackbar.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.2)';
    snackbar.style.zIndex = '9999';
    snackbar.style.opacity = '0';
    snackbar.style.transition = 'opacity 0.4s';
    document.body.appendChild(snackbar);
  }
  snackbar.textContent = message;
  snackbar.style.opacity = '1';
  setTimeout(() => {
    snackbar.style.opacity = '0';
  }, 2500);
}
