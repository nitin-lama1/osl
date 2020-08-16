<?php

namespace Drupal\custom_rest_api\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Defines a form that sets API key.
 */
class ApikeyConfiguration extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'config_api_key_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'custom_rest_api.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('custom_rest_api.settings');
    $form['api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Enter API Key'),
      '#default_value' => $config->get('api_key'),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $validate = strlen($form_state->getValue('api_key'));
    if ($validate > 16) {
      $form_state->setErrorByName('api_key', 'API Key must be a 16 digit text value.');
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('custom_rest_api.settings')
      ->set('api_key', $form_state->getValue('api_key'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
