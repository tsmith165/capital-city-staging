import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FaSlidersH, FaCouch, FaTable, FaChair, FaBed, FaBan, FaToilet, FaPaintBrush, FaBook } from 'react-icons/fa';
import { GiPillow, GiBookshelf } from 'react-icons/gi';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { PiDesk } from 'react-icons/pi';
import { FaRug } from 'react-icons/fa6';
import { RiPlantLine } from 'react-icons/ri';
import { GiCandles, GiParkBench, GiBarStool, GiForkKnifeSpoon, GiBedLamp } from 'react-icons/gi';
import { useQueryState } from 'nuqs';

const CATEGORY_FILTERS: [string, string, React.ComponentType<{ className?: string }>][] = [
    ['Couch', 'couch', FaCouch],
    ['Table', 'table', FaTable],
    ['Chair', 'chair', FaChair],
    ['Bedroom', 'bedroom', FaBed],
    ['Pillow', 'pillow', GiPillow],
    ['Bookcase', 'bookcase', GiBookshelf],
    ['Book', 'book', FaBook],
    ['Bathroom', 'bathroom', FaToilet],
    ['Kitchen', 'kitchen', GiForkKnifeSpoon],
    ['Lamp', 'lamp', GiBedLamp],
    ['Art', 'art', FaPaintBrush],
    ['Decor', 'decor', GiCandles],
    ['Bench', 'bench', GiParkBench],
    ['Barstool', 'barstool', GiBarStool],
    ['Rug', 'rug', FaRug],
    ['Plant', 'plant', RiPlantLine],
    ['Desk', 'desk', PiDesk],
    ['Other', 'other', IoIosAddCircleOutline],
    ['None', 'none', FaBan],
];

const FilterMenu: React.FC = () => {
    const [category, setCategory] = useQueryState('category');
    const [filterMenuOpen, setFilterMenuOpen] = React.useState(false);

    // Calculate columns based on number of items and container height
    const itemHeight = 40; // height of each icon + padding
    const containerHeight = window.innerHeight - 90; // 100dvh - 40px - 50px
    const itemsPerColumn = Math.floor(containerHeight / itemHeight);

    // Split filters into columns
    const columns = CATEGORY_FILTERS.reduce((acc: Array<typeof CATEGORY_FILTERS>, filter, i) => {
        const columnIndex = Math.floor(i / itemsPerColumn);
        acc[columnIndex] = acc[columnIndex] || [];
        acc[columnIndex].push(filter);
        return acc;
    }, []);

    return (
        <div onMouseEnter={() => setFilterMenuOpen(true)} onMouseLeave={() => setFilterMenuOpen(false)}>
            <div
                className={
                    `group absolute bottom-0 right-0 z-10 flex flex-row p-[5px] ` +
                    `${filterMenuOpen ? 'bg-secondary' : 'rounded-tl-lg bg-secondary_light'}`
                }
                onClick={(e) => {
                    e.preventDefault();
                    setFilterMenuOpen(!filterMenuOpen);
                }}
            >
                <FaSlidersH className={`${filterMenuOpen ? 'fill-stone-300' : 'fill-stone-950'} h-[30px] w-[30px] p-0.5`} />
            </div>
            {filterMenuOpen === true && (
                <div className="absolute bottom-[40px] right-0 flex h-[calc(100dvh-40px-50px)] flex-row-reverse gap-0">
                    {columns.map((columnFilters, colIndex) => {
                        console.log(`colIndex: ${colIndex}`);
                        console.log(`columnFilters: `, columnFilters);
                        return (
                            <div key={colIndex} className="flex h-full flex-col justify-end">
                                {columnFilters.map(([filter, filter_class, Icon], i) => (
                                    <div
                                        key={i}
                                        className={`group p-[5px] ${colIndex === 1 && i === columnFilters[1].length + 1 ? 'rounded-bl-lg first:rounded-tl-lg' : 'first:rounded-tl-lg'} ${
                                            filter === category ? 'bg-secondary' : 'bg-secondary_light hover:bg-secondary'
                                        }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCategory(filter === 'None' ? null : filter);
                                        }}
                                    >
                                        <Icon
                                            className={`h-[30px] w-[30px] filter-icon-${filter_class} ${
                                                filter === category ? 'fill-stone-300' : 'fill-stone-950 group-hover:fill-stone-300'
                                            }`}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                    {CATEGORY_FILTERS.map(([filter, filter_class, icon], i) => (
                        <Tooltip key={i} anchorSelect={`.filter-icon-${filter_class}`} place="left">
                            {filter}
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterMenu;
