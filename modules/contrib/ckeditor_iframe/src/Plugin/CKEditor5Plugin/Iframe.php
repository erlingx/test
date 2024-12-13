<?php

declare(strict_types=1);

namespace Drupal\ckeditor_iframe\Plugin\CKEditor5Plugin;

use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableInterface;
use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableTrait;
use Drupal\ckeditor5\Plugin\CKEditor5PluginElementsSubsetInterface;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefault;
use Drupal\Core\Form\FormStateInterface;
use Drupal\editor\EditorInterface;

/**
 * Defines a Drupal IFrame plugin for CKEditor5.
 */
class Iframe extends CKEditor5PluginDefault implements CKEditor5PluginElementsSubsetInterface, CKEditor5PluginConfigurableInterface {

  use CKEditor5PluginConfigurableTrait;

  /**
   * {@inheritDoc}
   */
  public function getElementsSubset(): array {
    $requiredAttributes = [
      'src',
    ];
    $allowedAttributes = array_merge($requiredAttributes, $this->configuration['enabled_optional_attributes']);
    $allowedAttributes = array_combine($allowedAttributes, $allowedAttributes);
    return [
      '<iframe>',
      sprintf("<iframe %s>", implode(' ', $allowedAttributes))
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $checkboxOptions = [];
    foreach ($this->getOptionalAttributes() as $attribute) {
      $label = $attribute;
      if (in_array($attribute, $this->getDeprecatedOptionalAttributes())) {
        $label .= ' ' . $this->t('(deprecated)');
      }
      $checkboxOptions[$attribute] = $label;
    }
    $form['enabled_optional_attributes'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Allowed optional attributes'),
      '#options' => $checkboxOptions,
      '#default_value' => $this->configuration['enabled_optional_attributes'],
      '#description' => $this->t("Beyond src, which attributes to allow on iframes. Refer to <a href=':url'>Mozilla's iFrame documentation</a> for a description of these attributes.", [
        ':url' => 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe',
      ]),
    ];
    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state) {
  }

  /**
   * {@inheritDoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $submittedAttributes = array_filter(array_values($form_state->getValue('enabled_optional_attributes')));
    $this->configuration['enabled_optional_attributes'] = $submittedAttributes;
  }

  /**
   * {@inheritDoc}
   */
  public function defaultConfiguration() {
    return [
      'enabled_optional_attributes' => array_diff($this->getOptionalAttributes(), $this->getDeprecatedOptionalAttributes()),
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function getDynamicPluginConfig(array $static_plugin_config, EditorInterface $editor): array {
    return [
      'iframe' => [
        'enabled_optional_attributes' => $this->configuration['enabled_optional_attributes'],
      ],
    ];
  }

  /**
   * Get a list of available attributes to allow for an iFrame.
   *
   * @return array
   *   The attributes.
   */
  private function getOptionalAttributes(): array {
    return [
      'align',
      'frameborder',
      'height',
      'width',
      'longdesc',
      'name',
      'scrolling',
      'tabindex',
      'title',
    ];
  }

  /**
   * List of attributes that shouldn't be used anymore.
   *
   * @return string[]
   *   The list of deprecated attributes.
   */
  private function getDeprecatedOptionalAttributes(): array {
    return [
      'align',
      'frameborder',
      'longdesc',
      'scrolling',
    ];
  }

}
