use chrono::{Utc, Duration, DurationRound};

use crate::shared::Id;
use crate::sql::Sql;
use super::data::PackStatsPair;
use super::sql;

pub async fn get_pack_stats(sql: &Sql, collector_id: &Id, pack_data_span: u32, pack_data_amount: u32) -> Result<Vec<PackStatsPair>, sqlx::Error> {
    let mut ret = Vec::new();

    let pack_data_span = Duration::seconds(pack_data_span as _);
    let now = Utc::now().duration_trunc(Duration::seconds(1)).unwrap();
    let end_date = now - Duration::seconds(now.timestamp() % pack_data_span.num_seconds()) + pack_data_span;
    let start_date = end_date - pack_data_span * pack_data_amount as _;

    let data = sql::get_pack_stats_db(sql, &collector_id, &start_date, &end_date).await?;

    for i in 0..pack_data_amount {
        let time_start = start_date + pack_data_span * i as _;
        let time_end = start_date + pack_data_span * (i+1) as _;

        let mut amount = 0;
        for (d, ) in data.iter() {
            if d >= &time_start && d < &time_end {
                amount += 1;
                break;
            }
        };

        ret.push(PackStatsPair { time: time_start, amount })
    }

    Ok(ret)
}
