<?php

namespace App\Enums;

enum AdoptionDocumentKind: string
{
    case Id = 'id';
    case FrontHouse = 'front_house';
    case StreetView = 'street_view';
    case LivingRoom = 'living_room';
    case DiningArea = 'dining_area';
    case Kitchen = 'kitchen';
    case Bedroom = 'bedroom';
    case Windows = 'windows';
    case Yard = 'yard';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
