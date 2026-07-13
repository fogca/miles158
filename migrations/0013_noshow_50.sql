-- No-show fee lowered from 100% to 50% of the base amount.
-- Legal review: a 100% no-show charge risks being void under Art. 9 of the
-- Consumer Contract Act; 50% matches major domestic rental operators (e.g.
-- Toyota Rent a Car). flagNoShows() reads this value at flag time.
UPDATE cancellation_policies SET no_show_fee_percent = 50;
