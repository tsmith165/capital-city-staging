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
    ['Bathroom', 'bathroom', FaToilet],
    ['Kitchen', 'kitchen', GiForkKnifeSpoon],
    ['Bookcase', 'bookcase', FaBook],
    ['Lamp', 'lamp', GiBedLamp],
    ['Art', 'art', FaPaintBrush],
    ['Decor', 'decor', GiCandles],
    ['Bench', 'bench', GiParkBench],
    ['Barstool', 'barstool', GiBarStool],
    ['Rug', 'rug', FaRug],
    ['Plant', 'plant', RiPlantLine],
    ['Book', 'book', FaBook],
    ['Desk', 'desk', PiDesk],
    ['Other', 'other', IoIosAddCircleOutline],
    ['None', 'none', FaBan],
];

const FilterMenu: React.FC = () => {
    const [category, setCategory] = useQueryState('category');
    const [filterMenuOpen, setFilterMenuOpen] = React.useState(false);

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
                <div className="absolute bottom-0 right-[40px] flex h-[40px] w-fit flex-row rounded-tl-lg md:rounded-bl-none md:rounded-tl-lg">
                    {CATEGORY_FILTERS.reverse().map(([filter, filter_class, Icon], i) => (
                        <div
                            key={i}
                            className={`group p-[5px] first:rounded-tl-lg ${
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
                    {CATEGORY_FILTERS.reverse().map(([filter, filter_class, icon], i) => (
                        <Tooltip key={i} anchorSelect={`.filter-icon-${filter_class}`} place="top">
                            {filter}
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterMenu;
