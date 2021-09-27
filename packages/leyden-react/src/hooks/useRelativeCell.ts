import {
    Cell,
    CellType,
    Coordinates,
    CoordinateTranslation,
    LeydenEditor,
} from 'leyden';
import { useEffect, useMemo, useState } from 'react';

import { useCellCoordinates } from './useCellCoordinates';
import { useLeydenStatic } from './useLeydenStatic';

export type UseRelativeCell = <T extends CellType>(
    type: T,
    base: Cell<CellType>,
    translation: CoordinateTranslation
) => Cell<T>|null;

export const useRelativeCell: UseRelativeCell = <T extends CellType>(
    type: T,
    base: Cell<CellType>,
    translation: CoordinateTranslation,
) => {
    const baseCoords = useCellCoordinates(base);
    const editor = useLeydenStatic();

    const relativeCoords = useMemo(() => {
        if (baseCoords === null) {
            return null;
        }
        return Coordinates.translate(baseCoords, translation);
    }, [baseCoords, translation]);

    const [cell, setCell] = useState(() => {
        if (relativeCoords === null) {
            return null;
        }
        return LeydenEditor.getCellTypeAtCoords<T>(editor, relativeCoords, type);
    });

    useEffect(() => {
        if (relativeCoords === null) {
            setCell(null);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return () => {};
        }
        const unsubscribe = LeydenEditor.subscribeToCell<T>(
            editor,
            relativeCoords,
            type,
            setCell,
        );
        return () => {
            unsubscribe();
        };
    }, [relativeCoords, type]);

    return cell;
};
