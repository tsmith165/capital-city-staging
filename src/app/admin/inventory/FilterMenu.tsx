import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FaSlidersH, FaCouch, FaTable, FaChair, FaBed, FaBan } from 'react-icons/fa';
import useInventoryStore from '@/stores/inventory_store';

const CATEGORY_FILTERS: [string, string, React.ComponentType<{ className?: string }>][] = [
    ['Couch', 'couch', FaCouch],
    ['Table', 'table', FaTable],
    ['Chair', 'chair', FaChair],
    ['Bed', 'bed', FaBed],
    ['None', 'none', FaBan],
];

const FilterMenu: React.FC = () => {
    const { category, filterMenuOpen, setCategory, setFilterMenuOpen } = useInventoryStore((state) => ({
        category: state.category,
        filterMenuOpen: state.filterMenuOpen,
        setCategory: state.setCategory,
        setFilterMenuOpen: state.setFilterMenuOpen,
    }));

    return (
        <div onMouseEnter={() => setFilterMenuOpen(true)} onMouseLeave={() => setFilterMenuOpen(false)}>
            <div
                className={
                    `group absolute bottom-0 right-0 z-10 flex flex-row p-[5px] ` +
                    `${filterMenuOpen ? 'bg-primary_dark ' : 'rounded-tl-lg bg-primary'}`
                }
                onClick={(e) => {
                    e.preventDefault();
                    setFilterMenuOpen(!filterMenuOpen);
                }}
            >
                <FaSlidersH className={`${filterMenuOpen ? 'fill-primary' : 'fill-primary_dark '} h-[30px] w-[30px] p-0.5`} />
            </div>
            {filterMenuOpen === true && (
                <div className="absolute bottom-0 right-[40px] flex h-[40px] w-fit flex-row rounded-tl-lg md:rounded-bl-none md:rounded-tl-lg">
                    {CATEGORY_FILTERS.reverse().map(([filter, filter_class, Icon], i) => (
                        <div
                            key={i}
                            className={`group p-[5px] first:rounded-tl-lg ${
                                filter === category ? 'bg-primary_dark' : 'bg-primary hover:bg-primary_dark'
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                setCategory(filter);
                            }}
                        >
                            <Icon
                                className={`h-[30px] w-[30px] filter-icon-${filter_class} ${
                                    filter === category ? 'fill-primary' : 'fill-primary_dark group-hover:fill-primary'
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