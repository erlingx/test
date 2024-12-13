<?php

namespace Drupal\eksponent\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\file\Entity\File;

/**
 * Plugin implementation of the 'div_wrapper_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "div_wrapper_formatter",
 *   label = @Translation("Div Wrapper Formatter"),
 *   field_types = {
 *     "image"
 *   }
 * )
 */
class DivWrapperFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    foreach ($items as $delta => $item) {
      // Check if 'target_id' is set on the image field.
      if (!empty($item->target_id)) {
        // Load the file entity using the target_id.
        $file = File::load($item->target_id);
        if ($file) {
          // Get the file URI.
          $uri = $file->getFileUri();

          // Define the image render array.
          $image_render_array = [
            '#theme' => 'image',
            '#uri' => $uri,
            '#attributes' => ['class' => ['custom-image-wrapper']],
            '#alt' => $item->alt,
            '#title' => $item->title,
          ];

          // Wrap the image render array within a div.
          $elements[$delta] = [
            '#type' => 'html_tag',
            '#tag' => 'div',
            '#attributes' => ['class' => ['div_eksponent']],
            'content' => $image_render_array,
          ];
        }
      }
      else {
        // Log in case no target_id is found
        \Drupal::logger('eksponent')
          ->debug('Image field is empty for item delta: @delta', ['@delta' => $delta]);
      }
      return $elements;
    }
  }
}
