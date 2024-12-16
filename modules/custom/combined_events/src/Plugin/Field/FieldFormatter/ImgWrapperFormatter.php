<?php

namespace Drupal\combined_events\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\file\Entity\File;

/**
 * Plugin implementation of the 'img_wrapper_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "img_wrapper_formatter",
 *   label = @Translation("Img Wrapper Formatter"),
 *   field_types = {
 *     "image"
 *   }
 * )
 */
class ImgWrapperFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    foreach ($items as $delta => $item) {
      if (!empty($item->target_id)) {
        $file = File::load($item->target_id);
        if ($file) {
          // Get the file URI.
          $uri = $file->getFileUri();

          $image_render_array = [
            '#theme' => 'image',
            '#uri' => $uri,
            '#attributes' => ['class' => ['custom-image-wrapper']],
            '#alt' => $item->alt,
            '#title' => $item->title,
          ];

          $elements[$delta] = [
            '#type' => 'html_tag',
            '#tag' => 'span',
            '#attributes' => ['class' => ['img_eksponent']],
            'content' => $image_render_array,
          ];
        }
      }
    }
    return $elements;
  }
}
